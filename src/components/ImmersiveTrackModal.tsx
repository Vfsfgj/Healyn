import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useArtist, parseDurationToSec } from '../context/ArtistContext';
import { Track } from '../types';
import { audioEngine } from '../utils/audioEngine';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Check,
  Disc3,
  Volume2,
  VolumeX,
  ArrowLeft,
  Headphones,
  Sparkles,
  Maximize2,
  Repeat,
  Repeat1,
  Shuffle,
  Timer
} from 'lucide-react';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  oz: number;
  size: number;
  type: 'head' | 'headband' | 'earcup' | 'hood' | 'hoodie_fabric' | 'drawstring' | 'aura';
  freqIdx: number;
  baseAlpha: number;
}

interface ImmersiveTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImmersiveTrackModal: React.FC<ImmersiveTrackModalProps> = ({ isOpen, onClose }) => {
  const {
    activeTrack,
    isPlaying,
    togglePlayPause,
    playTrack,
    tracks,
    audioVolume,
    setAudioVolume,
    showToast,
    setCurrentPage,
    playbackMode,
    cyclePlaybackMode,
    sleepTimerSeconds,
    sleepTimerEndAtTrackEnd,
    setSleepTimer
  } = useArtist();

  const currentTrack = activeTrack || tracks[0] || null;
  const lyricsList = useMemo(() => Array.isArray(currentTrack?.lyrics) ? currentTrack.lyrics : [], [currentTrack?.lyrics]);

  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [totalDurationSec, setTotalDurationSec] = useState<number>(() => {
    return currentTrack?.durationSec || parseDurationToSec(currentTrack?.duration) || 90;
  });
  const [isTimerMenuOpen, setIsTimerMenuOpen] = useState(false);
  const timerMenuRef = useRef<HTMLDivElement | null>(null);

  // Close timer popover when clicking outside
  useEffect(() => {
    if (!isTimerMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (timerMenuRef.current && !timerMenuRef.current.contains(e.target as Node)) {
        setIsTimerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTimerMenuOpen]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, rx: 0, ry: 0 });

  // 3D Point Cloud particles generation (~3000 points)
  const particles = useMemo<Particle3D[]>(() => {
    const pts: Particle3D[] = [];

    // 1. HEAD, FACE & HAIR (~650 points)
    for (let i = 0; i < 650; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI - Math.PI / 2;
      const rx = 0.66;
      const ry = 0.90;
      const rz = 0.76;

      let x = rx * Math.cos(v) * Math.cos(u);
      let y = ry * Math.sin(v) + 0.1;
      let z = rz * Math.cos(v) * Math.sin(u);

      if (y < 0.0) {
        const factor = 1 + (y - 0.1) * 0.42;
        x *= Math.max(0.4, factor);
        z *= Math.max(0.4, factor);
      }

      if (z > 0.42 && Math.abs(x) < 0.22 && y > -0.2 && y < 0.3) {
        z += 0.22 * (1 - Math.abs(x) / 0.22);
      }

      if (y > 0.2) {
        const hairNoise = (Math.random() - 0.5) * 0.09;
        x += hairNoise;
        y += Math.abs(hairNoise);
        z += hairNoise;
      }

      pts.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: Math.random() * 1.1 + 0.6,
        type: 'head',
        freqIdx: Math.floor(Math.random() * 32),
        baseAlpha: Math.random() * 0.5 + 0.35
      });
    }

    // Jawline & Chin (~120 points)
    for (let i = 0; i < 120; i++) {
      const t = (i / 120) * Math.PI - Math.PI / 2;
      const x = 0.42 * Math.sin(t);
      const y = -0.72 + Math.abs(Math.sin(t)) * 0.12;
      const z = 0.52 * Math.cos(t);
      pts.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: 1.2,
        type: 'head',
        freqIdx: Math.floor((i / 120) * 16),
        baseAlpha: 0.75
      });
    }

    // 2. NECK (~150 points)
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const h = Math.random() * 0.32;
      const rad = 0.30 + (1 - h / 0.32) * 0.06;
      const x = rad * Math.cos(a);
      const y = -0.72 - h;
      const z = rad * Math.sin(a) * 0.85;

      pts.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: Math.random() * 1.0 + 0.7,
        type: 'head',
        freqIdx: Math.floor(Math.random() * 16),
        baseAlpha: 0.5
      });
    }

    // 3. FOLDED HOOD (~650 points)
    for (let i = 0; i < 650; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 0.5;
      const rx = 0.82 + Math.random() * 0.24;
      const ry = 0.35 + Math.random() * 0.28;
      const rz = 0.65 + Math.random() * 0.38;

      let x = rx * Math.cos(u);
      let y = -0.85 - ry * Math.sin(v);
      let z = -0.15 - rz * Math.sin(u < Math.PI ? u : 0);

      const foldRipple = Math.sin(u * 8) * 0.08;

      pts.push({
        x: x + foldRipple,
        y: y + foldRipple,
        z: z,
        ox: x + foldRipple,
        oy: y + foldRipple,
        oz: z,
        size: Math.random() * 1.3 + 0.8,
        type: 'hood',
        freqIdx: Math.floor(Math.random() * 28),
        baseAlpha: Math.random() * 0.4 + 0.55
      });
    }

    // Hood Opening Rim Fold (~180 points)
    for (let i = 0; i < 180; i++) {
      const angle = (i / 180) * Math.PI * 2;
      const hx = 0.68 * Math.cos(angle);
      const hy = -0.82 + Math.sin(angle) * 0.12;
      const hz = -0.05 + Math.sin(angle) * 0.48;

      pts.push({
        x: hx, y: hy, z: hz,
        ox: hx, oy: hy, oz: hz,
        size: 1.5,
        type: 'hood',
        freqIdx: Math.floor((i / 180) * 20),
        baseAlpha: 0.88
      });
    }

    // 4. STUDIO HEADPHONES (~280 points)
    const earcupPositions = [
      { side: -1, cx: -0.74, cy: 0.12, cz: 0.02 },
      { side: 1, cx: 0.74, cy: 0.12, cz: 0.02 }
    ];

    earcupPositions.forEach(({ cx, cy, cz, side }) => {
      for (let i = 0; i < 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        const er = 0.36;
        const x = cx + side * 0.08 * Math.cos(a);
        const y = cy + er * Math.sin(a);
        const z = cz + er * Math.cos(a);

        pts.push({
          x, y, z,
          ox: x, oy: y, oz: z,
          size: 1.8,
          type: 'earcup',
          freqIdx: (i % 8) * 2,
          baseAlpha: 0.95
        });
      }

      for (let i = 0; i < 50; i++) {
        const a = Math.random() * Math.PI * 2;
        const er = Math.random() * 0.28;
        const x = cx + side * 0.05;
        const y = cy + er * Math.sin(a);
        const z = cz + er * Math.cos(a);

        pts.push({
          x, y, z,
          ox: x, oy: y, oz: z,
          size: 1.2,
          type: 'earcup',
          freqIdx: Math.floor(Math.random() * 12),
          baseAlpha: 0.85
        });
      }
    });

    // Headband (~100 points)
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * Math.PI;
      const archR = 0.90;
      const x = archR * Math.cos(t);
      const y = archR * Math.sin(t) + 0.16;
      const z = 0.02;

      pts.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: 1.6,
        type: 'headband',
        freqIdx: Math.floor((i / 100) * 24),
        baseAlpha: 0.95
      });
    }

    // 5. HOODIE BODY (~900 points)
    for (let i = 0; i < 600; i++) {
      const u = (i / 600) * 2 - 1;
      const spanX = u * 1.85;
      const absU = Math.abs(u);
      const dropY = -0.92 - Math.pow(absU, 1.2) * 0.85;
      const depthZ = Math.cos(u * Math.PI * 0.5) * 0.55 - (Math.random() * 0.35);
      const foldNoise = Math.sin(u * Math.PI * 12) * 0.06;

      pts.push({
        x: spanX,
        y: dropY + foldNoise,
        z: depthZ,
        ox: spanX,
        oy: dropY + foldNoise,
        oz: depthZ,
        size: Math.random() * 1.4 + 0.8,
        type: 'hoodie_fabric',
        freqIdx: Math.floor(Math.abs(u) * 28),
        baseAlpha: Math.max(0.3, 0.85 - absU * 0.25)
      });
    }

    for (let i = 0; i < 300; i++) {
      const u = (i / 300) * 2 - 1;
      const spanX = u * 1.55;
      const absU = Math.abs(u);
      const dropY = -1.1 - Math.pow(absU, 1.2) * 0.7;
      const depthZ = Math.cos(u * Math.PI * 0.5) * 0.65 - (Math.random() * 0.2);

      pts.push({
        x: spanX,
        y: dropY,
        z: depthZ,
        ox: spanX,
        oy: dropY,
        oz: depthZ,
        size: Math.random() * 1.2 + 0.7,
        type: 'hoodie_fabric',
        freqIdx: Math.floor(Math.abs(u) * 20),
        baseAlpha: 0.65
      });
    }

    // 6. DRAWSTRINGS (~80 points)
    const drawstringSides = [-0.18, 0.18];
    drawstringSides.forEach((startx) => {
      for (let k = 0; k < 40; k++) {
        const progressVal = k / 40;
        const x = startx + Math.sin(progressVal * Math.PI * 2) * 0.03;
        const y = -0.88 - progressVal * 0.55;
        const z = 0.42 + Math.cos(progressVal * Math.PI) * 0.03;

        pts.push({
          x, y, z,
          ox: x, oy: y, oz: z,
          size: k === 39 ? 2.0 : 1.1,
          type: 'drawstring',
          freqIdx: Math.floor(progressVal * 12),
          baseAlpha: 0.9
        });
      }
    });

    // 7. AMBIENT AURA (~160 points)
    for (let i = 0; i < 160; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.3 + Math.random() * 0.7;
      const x = r * Math.cos(a);
      const y = (Math.random() - 0.5) * 2.4;
      const z = (Math.random() - 0.5) * 1.4;

      pts.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        size: Math.random() * 1.3 + 0.5,
        type: 'aura',
        freqIdx: Math.floor(Math.random() * 32),
        baseAlpha: Math.random() * 0.3 + 0.15
      });
    }

    return pts;
  }, []);

  // Track progress and playback synchronization via audioEngine
  useEffect(() => {
    const trackDur = currentTrack?.durationSec || parseDurationToSec(currentTrack?.duration) || 90;
    setTotalDurationSec(trackDur);

    const unsub = audioEngine.addTimeUpdateListener((currTime, dur) => {
      const actualDuration = (dur && !isNaN(dur) && isFinite(dur) && dur > 0) ? dur : trackDur;
      setTotalDurationSec(actualDuration);
      setCurrentTimeSec(currTime);

      const pct = actualDuration > 0 ? Math.min(100, Math.max(0, (currTime / actualDuration) * 100)) : 0;
      setProgress(pct);
    });

    return () => unsub();
  }, [currentTrack]);

  // Reset progress when active track changes
  useEffect(() => {
    setProgress(0);
    setCurrentTimeSec(0);
  }, [currentTrack?.id]);

  // 3D Rendering loop on canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    let angleX = 0;
    let targetAngleY = 0;
    let targetAngleX = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        targetAngleY += 0.008;
      } else {
        targetAngleY += 0.002;
      }

      if (mouseRef.current.active) {
        targetAngleY = mouseRef.current.rx * 1.2;
        targetAngleX = mouseRef.current.ry * 0.5;
      } else {
        targetAngleX = Math.sin(Date.now() * 0.001) * 0.08;
      }

      angleY += (targetAngleY - angleY) * 0.08;
      angleX += (targetAngleX - angleX) * 0.08;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const centerX = width / 2;
      const centerY = (height / 2) + 22;
      const scale = Math.min(width, height) * 0.28;

      const time = Date.now() * 0.003;
      const transformedPts = [];

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        let freqVal = 0;
        if (isPlaying) {
          const freqOffset = (pt.freqIdx * 0.2) + time * 2;
          freqVal = (Math.sin(freqOffset) + 1) * 0.5;
        }

        const audioDisplacement = freqVal * 0.06;
        const curX = pt.ox * (1 + audioDisplacement);
        const curY = pt.oy * (1 + audioDisplacement);
        const curZ = pt.oz * (1 + audioDisplacement);

        const x1 = curX * cosY - curZ * sinY;
        const z1 = curX * sinY + curZ * cosY;
        const y2 = curY * cosX - z1 * sinX;
        const z2 = curY * sinX + z1 * cosX;

        const fov = 3.2;
        const pScale = fov / (fov + z2);
        const px = centerX + x1 * scale * pScale;
        const py = centerY - y2 * scale * pScale;

        transformedPts.push({
          px, py, z: z2,
          size: pt.size * pScale,
          baseAlpha: pt.baseAlpha,
          freqVal,
          type: pt.type
        });
      }

      transformedPts.sort((a, b) => a.z - b.z);

      // Render woven texture lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < transformedPts.length; i += 3) {
        const p1 = transformedPts[i];
        if (p1.type !== 'hood' && p1.type !== 'hoodie_fabric') continue;

        for (let j = i + 1; j < Math.min(i + 10, transformedPts.length); j += 2) {
          const p2 = transformedPts[j];
          if (p2.type !== 'hood' && p2.type !== 'hoodie_fabric') continue;

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distSq = dx * dx + dy * dy;

          if (distSq < 220) {
            const alphaLine = (1 - Math.sqrt(distSq) / 15) * 0.16;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(60, 60, 80, ${alphaLine})`;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Render points
      for (let i = 0; i < transformedPts.length; i++) {
        const pt = transformedPts[i];
        const depthAlpha = Math.max(0.15, Math.min(1, (pt.z + 1.2) / 2.4));
        const alpha = Math.min(1, pt.baseAlpha * depthAlpha + pt.freqVal * 0.6);

        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);

        if (pt.type === 'earcup') {
          ctx.fillStyle = `rgba(10, 10, 15, ${alpha})`;
        } else if (pt.type === 'headband') {
          ctx.fillStyle = `rgba(25, 25, 35, ${alpha * 0.95})`;
        } else if (pt.type === 'hood') {
          ctx.fillStyle = `rgba(45, 45, 60, ${alpha * 0.9})`;
        } else if (pt.type === 'hoodie_fabric') {
          ctx.fillStyle = `rgba(70, 70, 88, ${alpha * 0.85})`;
        } else if (pt.type === 'drawstring') {
          ctx.fillStyle = `rgba(15, 15, 25, ${alpha})`;
        } else if (pt.type === 'aura') {
          ctx.fillStyle = `rgba(140, 140, 160, ${alpha * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(100, 100, 115, ${alpha * 0.85})`;
        }

        ctx.fill();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, particles]);

  // Active Lyric calculation based on real current playback seconds
  const activeLyricIndex = useMemo(() => {
    if (!lyricsList || lyricsList.length === 0) return -1;
    let activeIdx = 0;
    for (let i = 0; i < lyricsList.length; i++) {
      if (currentTimeSec >= lyricsList[i].timeSec) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [lyricsList, currentTimeSec]);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll container to center the active lyric with zero document jitter
  useEffect(() => {
    if (!isOpen || !lyricsContainerRef.current || activeLyricIndex < 0) return;
    const container = lyricsContainerRef.current;
    const items = container.querySelectorAll<HTMLElement>('[data-lyric-line]');
    const targetEl = items[activeLyricIndex];
    if (targetEl) {
      const targetTop = targetEl.offsetTop - (container.clientHeight / 2) + (targetEl.clientHeight / 2);
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
    }
  }, [activeLyricIndex, isOpen]);

  // Prevent background page from scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = {
      x, y,
      active: true,
      rx: ((x / rect.width) - 0.5) * 2,
      ry: ((y / rect.height) - 0.5) * 2
    };
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
    mouseRef.current.rx = 0;
    mouseRef.current.ry = 0;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setProgress(newProgress);
    const targetSec = (newProgress / 100) * (totalDurationSec || 90);
    setCurrentTimeSec(targetSec);
    audioEngine.seek(targetSec);
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextTrack = tracks[(currentIndex + 1) % tracks.length];
    playTrack(nextTrack);
  };

  const handlePrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevTrack = tracks[(currentIndex - 1 + tracks.length) % tracks.length];
    playTrack(prevTrack);
  };

  if (!isOpen || !currentTrack) return null;

  const currentSeconds = Math.floor(currentTimeSec);
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const formattedCurrentTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSecsRounded = Math.round(totalDurationSec || 90);
  const totalMins = Math.floor(totalSecsRounded / 60);
  const totalSecsRem = totalSecsRounded % 60;
  const formattedTotalTime = `${String(totalMins).padStart(2, '0')}:${String(totalSecsRem).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 overflow-y-auto overscroll-contain animate-in fade-in duration-300">
      
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-2.5 sm:pb-4 border-b border-neutral-200 gap-2">
        <button
          onClick={onClose}
          className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Retour à la liste</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 font-mono-code text-[9px] sm:text-xs text-neutral-500 truncate min-w-0 justify-end">
          <span className="text-neutral-950 font-bold uppercase truncate max-w-[90px] sm:max-w-none">{currentTrack.status}</span>
          <span>·</span>
          <span className="shrink-0">{currentTrack.bpm} BPM</span>
          <span>·</span>
          <span className="shrink-0">{currentTrack.key}</span>
        </div>
      </div>

      {/* Center 3D Scene + Lyrics Area (On clean white background) */}
      <div className={`max-w-6xl mx-auto w-full my-auto py-6 items-center ${
        lyricsList.length > 0
          ? 'grid grid-cols-1 lg:grid-cols-12 gap-8'
          : 'flex flex-col items-center justify-center'
      }`}>
        
        {/* 3D Point Cloud Canvas */}
        <div className={`flex flex-col items-center justify-center ${
          lyricsList.length > 0 ? 'lg:col-span-5 lg:items-start' : 'w-full max-w-lg items-center'
        }`}>
          <div className="cursor-grab active:cursor-grabbing relative" title="Glisser pour faire pivoter le Nuage 3D">
            <canvas
              ref={canvasRef}
              width={460}
              height={270}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="w-80 h-48 sm:w-112 sm:h-64 touch-none select-none"
            />
          </div>

          <div className="mt-2 flex items-center gap-3">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-xs"
            />
            <div>
              <h3 className="text-lg font-bold text-neutral-950">{currentTrack.title}</h3>
              <p className="text-xs text-neutral-500 line-clamp-1">{currentTrack.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Live Lyrics directly on the same clean white background (Only rendered if lyrics exist) */}
        {lyricsList.length > 0 && (
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 w-full">
            
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-neutral-800 font-bold">
                PAROLES EN DIRECT
              </span>
              <span className="text-[10px] font-mono-code text-neutral-500">
                {currentTrack.title}
              </span>
            </div>

            <div className="relative overflow-hidden">
              <div
                ref={lyricsContainerRef}
                className="space-y-2.5 max-h-[260px] overflow-y-auto pr-2 scrollbar-none py-2 scroll-smooth [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
              >
                {lyricsList.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPast = idx < activeLyricIndex;

                  return (
                    <div
                      key={idx}
                      data-lyric-line
                      onClick={() => {
                        audioEngine.seek(line.timeSec);
                        setCurrentTimeSec(line.timeSec);
                      }}
                      title="Cliquer pour écouter à partir de cette phrase"
                      className={`cursor-pointer select-none transition-all duration-500 ease-out flex items-start gap-3 ${
                        isActive
                          ? 'text-neutral-950 font-bold text-base sm:text-xl tracking-tight border-l-2 border-neutral-950 pl-4 py-1.5 bg-neutral-100/70 rounded-r-xl shadow-xs'
                          : isPast
                          ? 'text-neutral-400 text-xs sm:text-sm pl-4 py-0.5 opacity-60 font-normal hover:opacity-85'
                          : 'text-neutral-500 text-xs sm:text-sm pl-4 py-0.5 font-normal hover:opacity-85'
                      }`}
                    >
                      {/* Lyric Text */}
                      <span className="flex-1 leading-snug">
                        {line.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Black Console Bar */}
      <div className="max-w-6xl mx-auto w-full pt-4 border-t border-neutral-200">
        
        <div className="bg-neutral-950 text-white rounded-none border border-neutral-800 shadow-2xl p-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 px-2">
            
            {/* Title & Info */}
            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-[10px] font-mono-code text-neutral-400">{currentTrack.status} · {formattedTotalTime}</p>
              </div>
            </div>

            {/* Seek Bar */}
            <div className="w-full lg:flex-1 max-w-xl mx-auto space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-400">
                <span className="tabular-nums font-semibold text-white">{formattedCurrentTime}</span>
                <span className="text-[9px] text-neutral-500 uppercase">DIFFUSION HD 24-BIT</span>
                <span className="tabular-nums">{formattedTotalTime}</span>
              </div>
              <div
                onClick={handleSeek}
                className="w-full h-1.5 bg-neutral-900 hover:h-2 rounded-full cursor-pointer transition-all relative overflow-hidden group border border-neutral-800"
              >
                <div
                  className="h-full bg-white transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-1">
                <button onClick={handlePrev} className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="px-4 py-2 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                      <span>Écouter</span>
                    </>
                  )}
                </button>
                <button onClick={handleNext} className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
                {/* Bouton Mode de Lecture (En boucle, Aléatoire, Par ordre) */}
                <button
                  onClick={cyclePlaybackMode}
                  title={
                    playbackMode === 'loop'
                      ? "Mode : En boucle (cliquer pour changer)"
                      : playbackMode === 'shuffle'
                      ? "Mode : Lecture aléatoire (cliquer pour changer)"
                      : "Mode : Lecture par ordre (cliquer pour changer)"
                  }
                  aria-label="Mode de lecture"
                  className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                    playbackMode !== 'order'
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {playbackMode === 'loop' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : playbackMode === 'shuffle' ? (
                    <Shuffle className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>

                {/* Bouton Minuteur d'arrêt automatique (Sleep Timer) */}
                <div className="relative">
                  <button
                    onClick={() => setIsTimerMenuOpen(prev => !prev)}
                    title={
                      sleepTimerSeconds !== null
                        ? `Minuteur actif : ${Math.ceil(sleepTimerSeconds / 60)} min restantes`
                        : sleepTimerEndAtTrackEnd
                        ? "Minuteur actif : arrêt à la fin du morceau"
                        : "Minuteur d'arrêt automatique"
                    }
                    aria-label="Minuteur de veille"
                    className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      sleepTimerSeconds !== null || sleepTimerEndAtTrackEnd
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    {sleepTimerSeconds !== null && (
                      <span className="text-[10px] font-mono-code font-bold text-white">
                        {Math.floor(sleepTimerSeconds / 60)}m
                      </span>
                    )}
                    {sleepTimerEndAtTrackEnd && (
                      <span className="text-[10px] font-mono-code font-bold text-white">
                        Fin
                      </span>
                    )}
                  </button>

                  {/* Menu Popover du Minuteur */}
                  {isTimerMenuOpen && (
                    <div
                      ref={timerMenuRef}
                      className="absolute bottom-full right-0 mb-2 w-56 bg-neutral-900/98 backdrop-blur-md border border-neutral-800 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-white"
                    >
                      <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-800 pb-1.5 mb-1 text-[11px] font-mono-code text-neutral-400">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5 text-white" />
                          <span>Minuteur d'arrêt</span>
                        </span>
                        <button
                          onClick={() => setIsTimerMenuOpen(false)}
                          className="text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(sleepTimerSeconds !== null || sleepTimerEndAtTrackEnd) && (
                        <div className="p-2 mb-1.5 bg-neutral-800/80 rounded-xl text-center">
                          <div className="text-[10px] text-neutral-200 font-mono-code">
                            {sleepTimerSeconds !== null
                              ? `Arrêt dans ${Math.floor(sleepTimerSeconds / 60)}m ${String(sleepTimerSeconds % 60).padStart(2, '0')}s`
                              : 'Arrêt à la fin de cette musique'}
                          </div>
                          <button
                            onClick={() => {
                              setSleepTimer(null);
                              setIsTimerMenuOpen(false);
                            }}
                            className="mt-1 text-[10px] text-neutral-400 hover:text-white underline font-mono-code cursor-pointer"
                          >
                            Annuler le minuteur
                          </button>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        {[
                          { label: '5 minutes', value: 5 },
                          { label: '15 minutes', value: 15 },
                          { label: '30 minutes', value: 30 },
                          { label: '45 minutes', value: 45 },
                          { label: '60 minutes', value: 60 }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSleepTimer(opt.value);
                              setIsTimerMenuOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between text-xs font-mono-code"
                          >
                            <span>{opt.label}</span>
                            {sleepTimerSeconds !== null && Math.ceil(sleepTimerSeconds / 60) === opt.value && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                        ))}

                        <button
                          onClick={() => {
                            setSleepTimer(null, true);
                            setIsTimerMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between text-xs font-mono-code border-t border-neutral-800/80 pt-1.5 mt-1"
                        >
                          <span>Fin du morceau en cours</span>
                          {sleepTimerEndAtTrackEnd && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Track Switcher Carousel */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tracks.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => playTrack(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono-code whitespace-nowrap transition-all cursor-pointer border ${
                t.id === currentTrack.id
                  ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
              }`}
            >
              {String(idx + 1).padStart(2, '0')}. {t.title}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
