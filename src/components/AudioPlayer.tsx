import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useArtist, parseDurationToSec } from '../context/ArtistContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  Check,
  Headphones,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

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

export const AudioPlayer: React.FC = () => {
  const {
    activeTrack,
    isPlaying,
    audioVolume,
    togglePlayPause,
    setAudioVolume,
    tracks,
    playTrack,
    toggleFavoriteTrack,
    showToast
  } = useArtist();

  const currentTrack = activeTrack || tracks[0];
  const [progress, setProgress] = useState<number>(0);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [totalDurationSec, setTotalDurationSec] = useState<number>(() => {
    return currentTrack?.durationSec || parseDurationToSec(currentTrack?.duration) || 90;
  });
  const [copied, setCopied] = useState(false);
  const [isExpandedVisualizer, setIsExpandedVisualizer] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; rx: number; ry: number }>({
    x: 0,
    y: 0,
    active: false,
    rx: 0,
    ry: 0
  });

  // Generate 3D point cloud representing a human head wearing headphones
  const particles = useMemo<Particle3D[]>(() => {
    const pts: Particle3D[] = [];

    // 1. HEAD, FACE & HAIR (Bare head, exposed face & hair contour) (~650 points)
    for (let i = 0; i < 650; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI - Math.PI / 2;
      
      const rx = 0.66;
      const ry = 0.90;
      const rz = 0.76;

      let x = rx * Math.cos(v) * Math.cos(u);
      let y = ry * Math.sin(v) + 0.1;
      let z = rz * Math.cos(v) * Math.sin(u);

      // Jaw & chin narrowing
      if (y < 0.0) {
        const factor = 1 + (y - 0.1) * 0.42;
        x *= Math.max(0.4, factor);
        z *= Math.max(0.4, factor);
      }

      // Nose bridge protrusion
      if (z > 0.42 && Math.abs(x) < 0.22 && y > -0.2 && y < 0.3) {
        z += 0.22 * (1 - Math.abs(x) / 0.22);
      }

      // Hair texture volume on top & back
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

    // Jawline & Chin Contour (~120 points)
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

    // 3. FOLDED HOOD (Capuche Rabattue autour du Col et de la Nuque) (~650 points)
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
      // Outer ring
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

      // Inner disc
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

    // 5. HOODIE BODY & TORSO (~900 points)
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

    // Chest & Pouch volume layer (~300 points)
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
        const progress = k / 40;
        const x = startx + Math.sin(progress * Math.PI * 2) * 0.03;
        const y = -0.88 - progress * 0.55;
        const z = 0.42 + Math.cos(progress * Math.PI) * 0.03;

        pts.push({
          x, y, z,
          ox: x, oy: y, oz: z,
          size: k === 39 ? 2.0 : 1.1,
          type: 'drawstring',
          freqIdx: Math.floor(progress * 12),
          baseAlpha: 0.9
        });
      }
    });

    // 7. AMBIENT AUDIO AURA PARTICLES (~160 points)
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

  // Track progress and playback synchronization
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

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
    setCurrentTimeSec(0);
  }, [currentTrack?.id]);

  // Canvas 3D Point Cloud Animation Loop (Sound + Touch Interactive)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angleY = 0;
    let angleX = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const data = audioEngine.getByteFrequencyData();
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Auto rotation + Mouse tilt smoothing
      const targetAngleY = mouseRef.current.rx * 0.8;
      const targetAngleX = mouseRef.current.ry * 0.4;

      if (isPlaying) {
        angleY += 0.008;
      } else {
        angleY += 0.003;
      }

      const curAngleY = angleY + targetAngleY;
      const curAngleX = Math.sin(Date.now() * 0.001) * 0.08 + targetAngleX;

      const cosY = Math.cos(curAngleY);
      const sinY = Math.sin(curAngleY);
      const cosX = Math.cos(curAngleX);
      const sinX = Math.sin(curAngleX);

      const centerX = width / 2;
      const centerY = (height / 2) + 22;
      const scale = Math.min(width, height) * 0.27;

      // Mouse interactive focal point
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active;

      // Calculate bass & treble average for global pulse
      let bassSum = 0;
      for (let b = 0; b < 6; b++) bassSum += data[b] || 0;
      const bassVal = bassSum / (6 * 255); // 0..1
      const pulseScale = 1 + (isPlaying ? bassVal * 0.12 : 0);

      // Sort points by Z depth for realistic rendering
      const transformedPts = particles.map(p => {
        // Audio pulse frequency displacement
        const freqVal = isPlaying ? (data[p.freqIdx % data.length] || 0) / 255 : 0.05;
        const audioDisp = 1 + freqVal * (p.type === 'earcup' ? 0.25 : 0.08);

        let x = p.ox * pulseScale * audioDisp;
        let y = p.oy * pulseScale * audioDisp;
        let z = p.oz * pulseScale * audioDisp;

        // 3D Yaw (Y-axis)
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;

        // 3D Pitch (X-axis)
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;

        // 2D Projection
        let px = centerX + x1 * scale;
        let py = centerY - y2 * scale;

        // Touch / Mouse Interaction: Push particles away when close to touch/mouse
        if (isMouseActive) {
          const dx = px - mx;
          const dy = py - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 70;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 18;
            px += (dx / dist) * force;
            py += (dy / dist) * force;
          }
        }

        return {
          px, py, z: z2,
          size: p.size * (1 + (z2 + 1) * 0.2) * (1 + freqVal * 0.5),
          type: p.type,
          baseAlpha: p.baseAlpha,
          freqVal
        };
      });

      transformedPts.sort((a, b) => a.z - b.z);

      // Woven Fabric Texture Lines between nearby Hood & Hoodie particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < transformedPts.length; i += 2) {
        const p1 = transformedPts[i];
        if (p1.type !== 'hood' && p1.type !== 'hoodie_fabric') continue;

        for (let j = i + 1; j < Math.min(i + 12, transformedPts.length); j++) {
          const p2 = transformedPts[j];
          if (p2.type !== 'hood' && p2.type !== 'hoodie_fabric') continue;

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distSq = dx * dx + dy * dy;

          if (distSq < 220) { // < ~15px distance
            const alphaLine = (1 - Math.sqrt(distSq) / 15) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(60, 60, 80, ${alphaLine})`;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Render Particles
      for (let i = 0; i < transformedPts.length; i++) {
        const pt = transformedPts[i];
        const depthAlpha = Math.max(0.15, Math.min(1, (pt.z + 1.2) / 2.4));
        const alpha = Math.min(1, pt.baseAlpha * depthAlpha + pt.freqVal * 0.6);

        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);

        if (pt.type === 'earcup') {
          ctx.fillStyle = `rgba(10, 10, 15, ${alpha})`;
          if (pt.freqVal > 0.4) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          } else {
            ctx.shadowBlur = 0;
          }
        } else if (pt.type === 'headband') {
          ctx.fillStyle = `rgba(25, 25, 35, ${alpha * 0.95})`;
          ctx.shadowBlur = 0;
        } else if (pt.type === 'hood') {
          ctx.fillStyle = `rgba(45, 45, 60, ${alpha * 0.9})`;
          ctx.shadowBlur = 0;
        } else if (pt.type === 'hoodie_fabric') {
          ctx.fillStyle = `rgba(70, 70, 88, ${alpha * 0.85})`;
          ctx.shadowBlur = 0;
        } else if (pt.type === 'drawstring') {
          ctx.fillStyle = `rgba(15, 15, 25, ${alpha})`;
          ctx.shadowBlur = 0;
        } else if (pt.type === 'aura') {
          ctx.fillStyle = `rgba(140, 140, 160, ${alpha * 0.5})`;
          ctx.shadowBlur = 0;
        } else {
          // Head / Face inside hood
          ctx.fillStyle = `rgba(100, 100, 115, ${alpha * 0.85})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, particles]);

  // Active Lyric calculation based on real current playback seconds
  const activeLyricIndex = useMemo(() => {
    if (!currentTrack?.lyrics || currentTrack.lyrics.length === 0) return -1;
    let activeIdx = 0;
    for (let i = 0; i < currentTrack.lyrics.length; i++) {
      if (currentTimeSec >= currentTrack.lyrics[i].timeSec) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [currentTrack?.lyrics, currentTimeSec]);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll container to center the active lyric with zero document jitter
  useEffect(() => {
    if (!lyricsContainerRef.current || activeLyricIndex < 0) return;
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
  }, [activeLyricIndex]);

  const handleNext = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
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

  const handleShare = () => {
    const url = `${window.location.origin}#musique-${currentTrack.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${currentTrack.title} — Streaming Haute Définition`,
        text: `Écoutez "${currentTrack.title}" (${currentTrack.bpm} BPM / ${currentTrack.key})`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      showToast(`Lien d'écoute de "${currentTrack.title}" copié !`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Touch & Mouse Handler for Interactive Head Point Cloud Canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((x / rect.width) - 0.5) * 2; // -1 to 1
    const ry = ((y / rect.height) - 0.5) * 2; // -1 to 1

    mouseRef.current = {
      x, y,
      active: true,
      rx, ry
    };
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
    mouseRef.current.rx = 0;
    mouseRef.current.ry = 0;
  };

  const currentSeconds = Math.floor(currentTimeSec);
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const formattedCurrentTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSecsRounded = Math.round(totalDurationSec || 90);
  const totalMins = Math.floor(totalSecsRounded / 60);
  const totalSecsRem = totalSecsRounded % 60;
  const formattedTotalTime = `${String(totalMins).padStart(2, '0')}:${String(totalSecsRem).padStart(2, '0')}`;

  return (
    <div className="relative mb-10 sm:mb-12 space-y-3">
      
      {/* Dynamic 3D Scene + Lyrics Split Area */}
      <div className="min-h-[220px] sm:min-h-[250px] flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-700 ease-in-out px-2">
        
        {/* Left Column: 3D Point Cloud Canvas (Slides left smoothly when music plays) */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center shrink-0 ${
          isPlaying ? 'lg:w-5/12 lg:items-start' : 'w-full lg:w-full items-center'
        }`}>
          <div className="cursor-grab active:cursor-grabbing relative group" title="Toucher / Glisser pour faire pivoter le Nuage 3D">
            <canvas
              ref={canvasRef}
              width={440}
              height={250}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="w-80 h-44 sm:w-100 sm:h-56 touch-none select-none transition-all duration-700"
            />
          </div>
        </div>

        {/* Right Column: Synchronized Song Lyrics Floating directly on the white background */}
        <div className={`transition-all duration-700 ease-in-out w-full ${
          isPlaying
            ? 'lg:w-7/12 opacity-100 translate-x-0 translate-y-0 max-h-[260px]'
            : 'lg:w-0 opacity-0 translate-x-0 lg:translate-x-12 translate-y-8 lg:translate-y-0 max-h-0 overflow-hidden pointer-events-none'
        }`}>
          {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
            <div className="space-y-3 py-1">
              
              {/* Minimalist Floating Header */}
              <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-neutral-800 font-bold">
                  PAROLES EN DIRECT
                </span>
                <span className="text-[10px] font-mono-code text-neutral-500 ml-auto">
                  {currentTrack.title}
                </span>
              </div>

              {/* Scrollable Floating Lyrics Stack with Top & Bottom Fade Mask */}
              <div className="relative overflow-hidden">
                <div
                  ref={lyricsContainerRef}
                  className="space-y-2 max-h-[195px] overflow-y-auto pr-1.5 scrollbar-none py-2 scroll-smooth [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
                >
                  {currentTrack.lyrics.map((line, idx) => {
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
                            ? 'text-neutral-950 font-bold text-base sm:text-lg tracking-tight border-l-2 border-neutral-950 pl-3.5 py-1 bg-neutral-100/60 rounded-r-xl shadow-xs'
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
          ) : (
            <div className="py-4 text-center text-neutral-400 text-xs font-mono-code italic">
              Paroles instrumentales en cours de synchronisation...
            </div>
          )}
        </div>

      </div>

      {/* Black Card Audio Console Bar Below */}
      <div className="bg-neutral-950 text-white rounded-none border border-neutral-800/90 shadow-2xl p-2.5 sm:p-3 transition-all hover:border-neutral-700">
        
        {/* 1-Line Studio Console Horizontal Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 sm:gap-4 px-2">
          
          {/* Zone A: Track Info */}
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-between sm:justify-start">
            <div className="min-w-0 flex-1 sm:flex-initial space-y-0.5">
              <h3 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[240px]">
                {currentTrack.title}
              </h3>

              <div className="flex items-center gap-2 text-[10px] font-mono-code text-neutral-400 truncate">
                <span className="text-neutral-300 font-medium">{currentTrack.status}</span>
                <span aria-hidden="true">·</span>
                <span>{currentTrack.bpm} BPM · {currentTrack.key}</span>
              </div>
            </div>
          </div>

        {/* Zone B: 1-Line Progress Bar scrubber with Timestamps */}
        <div className="w-full lg:flex-1 max-w-xl mx-auto space-y-1 py-1">
          <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-400 px-0.5">
            <span className="tabular-nums font-semibold text-white">{formattedCurrentTime}</span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider hidden sm:inline">
              DIFFUSION QUADRAPHONIQUE 360°
            </span>
            <span className="tabular-nums text-neutral-400">{formattedTotalTime}</span>
          </div>

          <div
            onClick={handleSeek}
            className="w-full h-1.5 bg-neutral-900 hover:h-2 rounded-full cursor-pointer transition-all relative overflow-hidden group border border-neutral-800/80"
            title="Avancement de la lecture"
          >
            <div
              className="h-full bg-white transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Zone C: Action Buttons (Play/Pause, Prev/Next, Fav, Volume) */}
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-neutral-900">
          
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              title="Piste précédente"
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Main Action Pill Button */}
            <button
              onClick={() => {
                if (activeTrack?.id === currentTrack.id) {
                  togglePlayPause();
                } else {
                  playTrack(currentTrack);
                }
              }}
              aria-label={isPlaying ? 'Pause' : 'Écouter en HD'}
              className="px-4 py-2 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
            >
              {isPlaying && activeTrack?.id === currentTrack.id ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                  <span>Écouter en HD</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              title="Piste suivante"
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
            <button
              onClick={() => toggleFavoriteTrack(currentTrack.id)}
              title={currentTrack.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentTrack.isFavorite
                  ? 'bg-[#800020]/30 text-[#b32d4e]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-[#800020] stroke-none' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              title="Partager cet extrait"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Compact Volume Control */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button
                onClick={() => setAudioVolume(audioVolume > 0 ? 0 : 0.8)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
                title={audioVolume === 0 ? "Activer le son" : "Couper le son"}
              >
                {audioVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={e => setAudioVolume(parseFloat(e.target.value))}
                className="w-16 accent-white h-1 cursor-pointer"
                title="Volume"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
);
};
