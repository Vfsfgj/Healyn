import { AudioPreset } from '../types';

type TimeUpdateCallback = (currentTime: number, duration: number) => void;
type EndedCallback = () => void;

class HDWebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isCurrentlyPlaying: boolean = false;
  private synthInterval: number | null = null;
  private currentPreset: AudioPreset = 'ambient';
  private activeNodes: (AudioNode | number)[] = [];
  private volumeLevel: number = 0.8;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private currentAudioUrl: string | null = null;

  // Real-time synchronization
  private currentTrackDuration: number = 90;
  private currentTrackTime: number = 0;
  private synthStartTime: number = 0;
  private timeUpdateListeners: Set<TimeUpdateCallback> = new Set();
  private endedListeners: Set<EndedCallback> = new Set();
  private progressTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
      
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(25, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.masterCompressor);
      this.masterCompressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupAudioElement() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      const updateDuration = () => {
        if (!this.audioElement) return;
        const d = this.audioElement.duration;
        if (d && !isNaN(d) && isFinite(d) && d > 0) {
          this.currentTrackDuration = d;
          this.notifyTimeUpdate();
        }
      };

      this.audioElement.addEventListener('timeupdate', () => {
        if (!this.audioElement) return;
        this.currentTrackTime = this.audioElement.currentTime;
        updateDuration();
        this.notifyTimeUpdate();
      });

      this.audioElement.addEventListener('loadedmetadata', updateDuration);
      this.audioElement.addEventListener('durationchange', updateDuration);
      this.audioElement.addEventListener('canplay', updateDuration);

      this.audioElement.addEventListener('ended', () => {
        this.isCurrentlyPlaying = false;
        this.currentTrackTime = this.currentTrackDuration;
        this.notifyTimeUpdate();
        this.notifyEnded();
      });
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getByteFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public setVolume(val: number) {
    this.volumeLevel = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volumeLevel, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volumeLevel;
    }
  }

  public getCurrentTime(): number {
    if (this.audioElement && this.currentAudioUrl) {
      return this.audioElement.currentTime ?? this.currentTrackTime;
    }
    return this.currentTrackTime;
  }

  public getDuration(): number {
    return this.currentTrackDuration;
  }

  public addTimeUpdateListener(cb: TimeUpdateCallback): () => void {
    this.timeUpdateListeners.add(cb);
    cb(this.getCurrentTime(), this.getDuration());
    return () => this.timeUpdateListeners.delete(cb);
  }

  public addEndedListener(cb: EndedCallback): () => void {
    this.endedListeners.add(cb);
    return () => this.endedListeners.delete(cb);
  }

  private notifyTimeUpdate() {
    const cur = this.getCurrentTime();
    const dur = this.getDuration();
    this.timeUpdateListeners.forEach(cb => {
      try { cb(cur, dur); } catch (e) { console.error(e); }
    });
  }

  private notifyEnded() {
    this.endedListeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  public seek(timeSec: number) {
    const clamped = Math.max(0, Math.min(this.currentTrackDuration, timeSec));
    this.currentTrackTime = clamped;

    if (this.audioElement && this.currentAudioUrl) {
      try {
        this.audioElement.currentTime = clamped;
      } catch (err) {
        console.warn('Seek error on audioElement:', err);
      }
    } else {
      this.synthStartTime = Date.now() - clamped * 1000;
    }

    this.notifyTimeUpdate();
  }

  public play(preset: AudioPreset, audioUrl?: string, defaultDurationSec?: number, forceRestart: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const isNewAudio = Boolean(audioUrl) && (audioUrl !== this.currentAudioUrl);
    const shouldResetTime = forceRestart || isNewAudio;

    // Smoothly stop existing playback without clicks
    this.stop(false);
    this.currentPreset = preset;
    this.isCurrentlyPlaying = true;
    if (defaultDurationSec && defaultDurationSec > 0) {
      this.currentTrackDuration = defaultDurationSec;
    }

    // Soft anti-pop attack ramp (8ms)
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.linearRampToValueAtTime(this.volumeLevel, now + 0.008);

    if (audioUrl) {
      try {
        this.setupAudioElement();
        if (this.audioElement) {
          if (!this.audioSourceNode) {
            this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
            this.audioSourceNode.connect(this.masterGain);
          }

          if (isNewAudio) {
            this.currentAudioUrl = audioUrl;
            this.audioElement.src = audioUrl;
            this.audioElement.currentTime = 0;
            this.currentTrackTime = 0;
            this.audioElement.load();
          } else if (forceRestart) {
            this.audioElement.currentTime = 0;
            this.currentTrackTime = 0;
          } else {
            // Ensure audio element aligns with stored track time if sought while paused
            if (Math.abs((this.audioElement.currentTime || 0) - this.currentTrackTime) > 0.3) {
              try {
                this.audioElement.currentTime = this.currentTrackTime;
              } catch {}
            }
          }

          this.audioElement.volume = this.volumeLevel;
          const playPromise = this.audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.warn('Playback error for audio URL:', err);
            });
          }

          // High frequency 50ms smooth ticker for custom audio element
          if (this.progressTimer) {
            window.clearInterval(this.progressTimer);
          }
          this.progressTimer = window.setInterval(() => {
            if (!this.isCurrentlyPlaying || !this.audioElement) return;
            this.currentTrackTime = this.audioElement.currentTime;
            if (this.audioElement.duration && !isNaN(this.audioElement.duration) && isFinite(this.audioElement.duration) && this.audioElement.duration > 0) {
              this.currentTrackDuration = this.audioElement.duration;
            }
            this.notifyTimeUpdate();
          }, 50);

          return;
        }
      } catch (err) {
        console.warn('Failed to load custom audio element:', err);
      }
    }

    // Otherwise synth playback
    this.currentAudioUrl = null;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch {}
    }

    if (shouldResetTime) {
      this.currentTrackTime = 0;
    }

    this.synthStartTime = Date.now() - this.currentTrackTime * 1000;

    // Start high frequency ticker for synthesized sound duration
    if (this.progressTimer) {
      window.clearInterval(this.progressTimer);
    }
    this.progressTimer = window.setInterval(() => {
      if (!this.isCurrentlyPlaying) return;
      const elapsed = (Date.now() - this.synthStartTime) / 1000;
      this.currentTrackTime = elapsed;
      this.notifyTimeUpdate();

      if (elapsed >= this.currentTrackDuration) {
        this.stop(true);
        this.currentTrackTime = 0;
        this.notifyTimeUpdate();
        this.notifyEnded();
      }
    }, 50);

    const synthNow = this.ctx.currentTime;
    const ctx = this.ctx;
    const dest = this.masterGain;

    // Build unique musical texture per preset
    switch (preset) {
      case 'ambient': {
        const freqs = [110, 164.81, 220, 329.63, 440];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600 + idx * 150, now);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.2 + idx * 0.1, now);
          lfoGain.gain.setValueAtTime(0.08, now);
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);

          gain.gain.setValueAtTime(0.02, now);
          gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 1.5);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(now);
          lfo.start(now);
          this.activeNodes.push(osc, lfo, gain, filter);
        });
        break;
      }

      case 'synthwave': {
        const notes = [130.81, 155.56, 174.61, 196.0, 233.08];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(65.41, now);
        bassGain.gain.setValueAtTime(0.15, now);
        bassOsc.connect(bassGain);
        bassGain.connect(dest);
        bassOsc.start(now);
        this.activeNodes.push(bassOsc, bassGain);

        let noteIndex = 0;
        const interval = window.setInterval(() => {
          if (!this.isCurrentlyPlaying || !this.ctx) return;
          const t = this.ctx.currentTime;
          const arpOsc = this.ctx.createOscillator();
          const arpGain = this.ctx.createGain();
          const arpFilter = this.ctx.createBiquadFilter();

          arpOsc.type = 'triangle';
          arpOsc.frequency.setValueAtTime(notes[noteIndex % notes.length], t);
          arpFilter.type = 'lowpass';
          arpFilter.frequency.setValueAtTime(1400, t);

          arpGain.gain.setValueAtTime(0.08, t);
          arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          arpOsc.connect(arpFilter);
          arpFilter.connect(arpGain);
          arpGain.connect(this.masterGain!);

          arpOsc.start(t);
          arpOsc.stop(t + 0.4);
          noteIndex++;
        }, 180);

        this.activeNodes.push(interval);
        break;
      }

      case 'neoclassical': {
        const chords = [146.83, 220.0, 293.66, 349.23, 440.0];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.1 / (idx + 1), now + 0.8);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          this.activeNodes.push(osc, gain);
        });
        break;
      }

      case 'chillpulse':
      case 'minimal':
      default: {
        const padOsc = ctx.createOscillator();
        const padGain = ctx.createGain();
        padOsc.type = 'triangle';
        padOsc.frequency.setValueAtTime(174.61, now);
        padGain.gain.setValueAtTime(0.09, now);
        padOsc.connect(padGain);
        padGain.connect(dest);
        padOsc.start(now);
        this.activeNodes.push(padOsc, padGain);

        const pulseInterval = window.setInterval(() => {
          if (!this.isCurrentlyPlaying || !this.ctx) return;
          const t = this.ctx.currentTime;
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();

          kickOsc.frequency.setValueAtTime(120, t);
          kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.2);

          kickGain.gain.setValueAtTime(0.2, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          kickOsc.connect(kickGain);
          kickGain.connect(this.masterGain!);

          kickOsc.start(t);
          kickOsc.stop(t + 0.3);
        }, 600);

        this.activeNodes.push(pulseInterval);
        break;
      }
    }
  }

  public pause() {
    this.stop(false);
  }

  public stop(resetTime: boolean = false) {
    this.isCurrentlyPlaying = false;

    // Instant smooth anti-click micro-fade (5ms) on master gain
    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.00001, now + 0.005);
      } catch {}
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        if (resetTime) {
          this.audioElement.currentTime = 0;
          this.currentTrackTime = 0;
          this.currentAudioUrl = null;
        }
      } catch {}
    }
    if (resetTime) {
      this.currentTrackTime = 0;
      this.currentAudioUrl = null;
    }
    if (this.progressTimer) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else if (node && 'stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        try {
          (node as AudioScheduledSourceNode).stop();
        } catch {}
      } else if (node && 'disconnect' in node) {
        try {
          (node as AudioNode).disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
    this.notifyTimeUpdate();
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public getPreset(): AudioPreset {
    return this.currentPreset;
  }
}

export const audioEngine = new HDWebAudioEngine();
