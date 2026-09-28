/**
 * Audio Compressor Utility
 * Decodes, normalizes dynamics, and compresses audio files (MP3/WAV/AAC)
 * using Web Audio API OfflineAudioContext for lightweight storage & crisp playback.
 */

export function getAudioDurationFromFile(file: File): Promise<{ durationStr: string; durationSec: number }> {
  return new Promise((resolve) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({ durationStr: '03:00', durationSec: 180 });
      return;
    }

    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanup = () => {
      try {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } catch {}
    };

    audio.onloadedmetadata = () => {
      cleanup();
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        const totalSecs = Math.round(audio.duration);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        resolve({
          durationStr: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          durationSec: totalSecs
        });
      } else {
        resolve({ durationStr: '03:00', durationSec: 180 });
      }
    };

    audio.onerror = () => {
      cleanup();
      resolve({ durationStr: '03:00', durationSec: 180 });
    };

    audio.src = objectUrl;
  });
}

export async function compressAudioFile(
  file: File,
  maxDurationSec: number = 300
): Promise<{ audioUrl: string; duration: string; durationSec: number; originalSizeMb: string; compressedSizeMb: string }> {
  const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const tempCtx = new AudioCtxClass();

    // Universal decodeAudioData supporting both Callback and Promise styles across all browser engines
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      let settled = false;
      const onDecoded = (buf: AudioBuffer) => {
        if (!settled) {
          settled = true;
          resolve(buf);
        }
      };
      const onErr = (e: unknown) => {
        if (!settled) {
          settled = true;
          reject(e);
        }
      };

      try {
        const res = tempCtx.decodeAudioData(arrayBuffer.slice(0), onDecoded, onErr);
        if (res && typeof (res as Promise<AudioBuffer>).then === 'function') {
          (res as Promise<AudioBuffer>).then(onDecoded).catch(onErr);
        }
      } catch (err) {
        onErr(err);
      }
    });

    try {
      await tempCtx.close();
    } catch {}

    const originalDuration = audioBuffer.duration;
    const targetDuration = Math.min(originalDuration, maxDurationSec);
    const durationSec = Math.round(targetDuration);

    // Target sample rate: 24,000 Hz Mono for optimal compression with acoustic clarity
    const targetSampleRate = 24000;
    const targetLength = Math.max(1, Math.floor(targetDuration * targetSampleRate));

    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Dynamics Compressor Node for clean studio-level dynamics without clipping
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, 0);
    compressor.knee.setValueAtTime(15, 0);
    compressor.ratio.setValueAtTime(4, 0);
    compressor.attack.setValueAtTime(0.004, 0);
    compressor.release.setValueAtTime(0.12, 0);

    source.connect(compressor);
    compressor.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
    const audioUrl = await blobToDataURL(wavBlob);
    const compressedSizeMb = (wavBlob.size / (1024 * 1024)).toFixed(2);

    const mins = Math.floor(targetDuration / 60);
    const secs = Math.floor(targetDuration % 60);
    const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return {
      audioUrl,
      duration: formattedDuration,
      durationSec,
      originalSizeMb,
      compressedSizeMb
    };
  } catch (err) {
    console.warn('Browser offline audio compression fallback:', err);
    // Fallback: read directly as DataURL and extract real duration from audio metadata
    const rawDataUrl = await blobToDataURL(file);
    const realDurationInfo = await getAudioDurationFromFile(file).catch(() => ({ durationStr: '03:00', durationSec: 180 }));

    return {
      audioUrl: rawDataUrl,
      duration: realDurationInfo.durationStr,
      durationSec: realDurationInfo.durationSec,
      originalSizeMb,
      compressedSizeMb: originalSizeMb
    };
  }
}

function getAudioDurationFromUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        resolve(Math.round(audio.duration));
      } else {
        resolve(150);
      }
    };
    audio.onerror = () => resolve(150);
  });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const actualLen = Math.min(len, abuffer.length);
  const length = actualLen * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF Header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // FMT Chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // Subchunk1Size (16 for PCM)
  setUint16(1); // AudioFormat (1 = PCM)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2); // BlockAlign
  setUint16(16); // BitsPerSample

  // DATA Chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < actualLen) {
    for (let i = 0; i < numOfChan; i++) {
      const s = Math.max(-1, Math.min(1, channels[i][offset] || 0));
      // Accurate 16-bit signed integer conversion
      const pcmSample = s < 0 ? Math.trunc(s * 0x8000) : Math.trunc(s * 0x7FFF);
      view.setInt16(pos, pcmSample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

