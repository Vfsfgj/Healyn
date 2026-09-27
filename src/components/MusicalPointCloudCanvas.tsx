import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useArtist } from '../context/ArtistContext';
import { audioEngine } from '../utils/audioEngine';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export type ShapeMode = 'galaxy' | 'cross' | 'headphone' | 'chandelier';

const SHAPES: { id: ShapeMode; label: string }[] = [
  { id: 'galaxy', label: 'Galaxie' },
  { id: 'cross', label: 'Croix' },
  { id: 'headphone', label: 'Silhouette Casque' },
  { id: 'chandelier', label: 'Chandelier & Baffles' }
];

interface Particle3D {
  // Current interpolated position
  x: number;
  y: number;
  z: number;

  // Target coordinates for each shape
  galaxy: { x: number; y: number; z: number };
  cross: { x: number; y: number; z: number };
  headphone: { x: number; y: number; z: number };
  chandelier: { x: number; y: number; z: number };

  size: number;
  freqIdx: number;
  baseAlpha: number;
  colorType: 'core' | 'ring' | 'arm' | 'fabric';
}

export const MusicalPointCloudCanvas: React.FC = () => {
  const { isPlaying, togglePlayPause, activeTrack, tracks } = useArtist();
  const currentTrack = activeTrack || tracks[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeShape, setActiveShape] = useState<ShapeMode>('galaxy');

  // Automatic Shape Morphing Timer (cycles shapes every 6.5s)
  useEffect(() => {
    const shapeInterval = setInterval(() => {
      setActiveShape((prev) => {
        const currentIndex = SHAPES.findIndex(s => s.id === prev);
        const nextIndex = (currentIndex + 1) % SHAPES.length;
        return SHAPES[nextIndex].id;
      });
    }, 6500);

    return () => clearInterval(shapeInterval);
  }, []);

  const handlePrevShape = () => {
    const currentIndex = SHAPES.findIndex(s => s.id === activeShape);
    const prevIndex = (currentIndex - 1 + SHAPES.length) % SHAPES.length;
    setActiveShape(SHAPES[prevIndex].id);
  };

  const handleNextShape = () => {
    const currentIndex = SHAPES.findIndex(s => s.id === activeShape);
    const nextIndex = (currentIndex + 1) % SHAPES.length;
    setActiveShape(SHAPES[nextIndex].id);
  };

  // Mouse & Touch interaction state
  const touchRef = useRef({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    active: false,
    isDown: false
  });

  // Generate 3D Target Points for Galaxie, Croix, and Homme au Casque (~2800 points)
  const particles = useMemo<Particle3D[]>(() => {
    const COUNT = 2800;
    const pts: Particle3D[] = [];

    // Helper generators
    // 1. GALAXIE GENERATOR
    const getGalaxyPos = (i: number) => {
      if (i < 800) {
        // Spiral arm 1
        const t = (i / 800) * Math.PI * 5;
        const r = 0.15 + (i / 800) * 1.6;
        const armAngle = t + 0.1;
        const noise = (Math.random() - 0.5) * 0.12;
        return {
          x: (r + noise) * Math.cos(armAngle),
          y: (Math.random() - 0.5) * 0.22,
          z: (r + noise) * Math.sin(armAngle)
        };
      } else if (i < 1600) {
        // Spiral arm 2 (opposite)
        const idx = i - 800;
        const t = (idx / 800) * Math.PI * 5;
        const r = 0.15 + (idx / 800) * 1.6;
        const armAngle = t + Math.PI + 0.1;
        const noise = (Math.random() - 0.5) * 0.12;
        return {
          x: (r + noise) * Math.cos(armAngle),
          y: (Math.random() - 0.5) * 0.22,
          z: (r + noise) * Math.sin(armAngle)
        };
      } else if (i < 2200) {
        // Galactic dense core
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI - Math.PI / 2;
        const r = 0.55 * Math.random();
        return {
          x: r * Math.cos(v) * Math.cos(u),
          y: r * Math.sin(v) * 0.5,
          z: r * Math.cos(v) * Math.sin(u)
        };
      } else {
        // Outer cosmic halo dust
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dist = 1.3 + Math.random() * 1.2;
        return {
          x: dist * Math.sin(phi) * Math.cos(theta),
          y: dist * Math.sin(phi) * Math.sin(theta) * 0.4,
          z: dist * Math.cos(phi)
        };
      }
    };

    // 2. CROIX GENERATOR (3D Sacred Geometry Cross with Ambient Halo Particles)
    const getCrossPos = (i: number) => {
      if (i < 1100) {
        // Vertical beam (-1.3 to +1.2)
        const t = (i / 1100) * 2.5 - 1.3;
        const width = 0.18 * (1 - Math.abs(t) * 0.15);
        const u = Math.random() * Math.PI * 2;
        const r = Math.random() * width;
        return {
          x: r * Math.cos(u),
          y: t,
          z: r * Math.sin(u)
        };
      } else if (i < 1900) {
        // Horizontal crossbar (-1.05 to +1.05, centered at y = 0.35)
        const idx = i - 1100;
        const t = (idx / 800) * 2.1 - 1.05;
        const width = 0.18;
        const u = Math.random() * Math.PI * 2;
        const r = Math.random() * width;
        return {
          x: t,
          y: 0.35 + r * Math.sin(u),
          z: r * Math.cos(u)
        };
      } else if (i < 2200) {
        // Radiating 3D aura beam ring at cross center
        const idx = i - 1900;
        const angle = (idx / 300) * Math.PI * 2;
        const ringR = 0.45 + Math.random() * 0.55;
        return {
          x: ringR * Math.cos(angle),
          y: 0.35 + (Math.random() - 0.5) * 0.15,
          z: ringR * Math.sin(angle)
        };
      } else {
        // Ambient cosmic halo particles floating everywhere around the cross
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dist = 0.7 + Math.random() * 1.5;
        return {
          x: dist * Math.sin(phi) * Math.cos(theta),
          y: 0.2 + dist * Math.sin(phi) * Math.sin(theta) * 0.85,
          z: dist * Math.cos(phi)
        };
      }
    };

    // 3. HOMME AU CASQUE GENERATOR (Identical to Music Modal Point Cloud Sculpture)
    const getHeadphonePos = (i: number) => {
      // Total 2800 points mapped:
      if (i < 650) {
        // 1. Head, Face & Hair Contour
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

        return { x, y, z };
      } else if (i < 770) {
        // Jawline & Chin
        const idx = i - 650;
        const t = (idx / 120) * Math.PI - Math.PI / 2;
        const x = 0.42 * Math.sin(t);
        const y = -0.72 + Math.abs(Math.sin(t)) * 0.12;
        const z = 0.52 * Math.cos(t);
        return { x, y, z };
      } else if (i < 920) {
        // Neck Cylinder
        const idx = i - 770;
        const a = Math.random() * Math.PI * 2;
        const h = Math.random() * 0.32;
        const rad = 0.30 + (1 - h / 0.32) * 0.06;
        const x = rad * Math.cos(a);
        const y = -0.72 - h;
        const z = rad * Math.sin(a) * 0.85;
        return { x, y, z };
      } else if (i < 1570) {
        // Folded Hood Sculpture
        const idx = i - 920;
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 0.5;
        const rx = 0.82 + Math.random() * 0.24;
        const ry = 0.35 + Math.random() * 0.28;
        const rz = 0.65 + Math.random() * 0.38;

        let x = rx * Math.cos(u);
        let y = -0.85 - ry * Math.sin(v);
        let z = -0.15 - rz * Math.sin(u < Math.PI ? u : 0);

        const foldRipple = Math.sin(u * 8) * 0.08;
        return { x: x + foldRipple, y: y + foldRipple, z };
      } else if (i < 1750) {
        // Hood Opening Rim Fold
        const idx = i - 1570;
        const angle = (idx / 180) * Math.PI * 2;
        const x = 0.68 * Math.cos(angle);
        const y = -0.82 + Math.sin(angle) * 0.12;
        const z = -0.05 + Math.sin(angle) * 0.48;
        return { x, y, z };
      } else if (i < 2030) {
        // Studio Headphones Earcups & Cushion Pads
        const idx = i - 1750;
        const side = idx % 2 === 0 ? -1 : 1;
        const cx = side * 0.74;
        const cy = 0.12;
        const cz = 0.02;

        const a = (idx / 280) * Math.PI * 2;
        const er = 0.36;
        const x = cx + side * 0.08 * Math.cos(a);
        const y = cy + er * Math.sin(a);
        const z = cz + er * Math.cos(a);
        return { x, y, z };
      } else if (i < 2130) {
        // Headband Arch
        const idx = i - 2030;
        const t = (idx / 100) * Math.PI;
        const archR = 0.90;
        const x = archR * Math.cos(t);
        const y = archR * Math.sin(t) + 0.16;
        const z = 0.02;
        return { x, y, z };
      } else if (i < 2650) {
        // Hoodie Body & Shoulder Drapes
        const idx = i - 2130;
        const u = (idx / 520) * 2 - 1;
        const spanX = u * 1.85;
        const absU = Math.abs(u);
        const dropY = -0.92 - Math.pow(absU, 1.2) * 0.85;
        const depthZ = Math.cos(u * Math.PI * 0.5) * 0.55 - (Math.random() * 0.35);
        const foldNoise = Math.sin(u * Math.PI * 12) * 0.06;
        return { x: spanX, y: dropY + foldNoise, z: depthZ };
      } else if (i < 2730) {
        // Drawstrings
        const idx = i - 2650;
        const side = idx % 2 === 0 ? -0.18 : 0.18;
        const progressVal = (idx / 80);
        const x = side + Math.sin(progressVal * Math.PI * 2) * 0.03;
        const y = -0.88 - progressVal * 0.55;
        const z = 0.42 + Math.cos(progressVal * Math.PI) * 0.03;
        return { x, y, z };
      } else {
        // Ambient Cosmos Aura Field
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dist = 1.2 + Math.random() * 1.2;
        return {
          x: dist * Math.sin(phi) * Math.cos(theta),
          y: dist * Math.sin(phi) * Math.sin(theta),
          z: dist * Math.cos(phi)
        };
      }
    };

    // 4. CHANDELIER ET BAFFLES GENERATOR (Ornate Candelabra with 5 Candle Flames flanked by Speakers)
    const getChandelierPos = (i: number) => {
      if (i < 400) {
        // Central Pillar & Tiered Base
        const idx = i;
        if (idx < 250) {
          // Main Carved Central Shaft
          const progress = idx / 250;
          const y = -0.85 + progress * 1.15;
          const r = 0.06 + Math.sin(progress * Math.PI * 4) * 0.04;
          const a = Math.random() * Math.PI * 2;
          return {
            x: r * Math.cos(a),
            y,
            z: r * Math.sin(a)
          };
        } else {
          // Circular Base Pedestal
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.45;
          return {
            x: r * Math.cos(a),
            y: -0.92,
            z: r * Math.sin(a)
          };
        }
      } else if (i < 750) {
        // 5 Curved Candelabra Arms & Sockets
        const idx = i - 400;
        const armNum = idx % 5;
        const armXTargets = [0, -0.34, 0.34, -0.65, 0.65];
        const targetX = armXTargets[armNum];
        const progress = Math.random();

        // Parabolic swooping curve for arm
        const x = targetX * progress;
        const y = -0.05 + Math.pow(progress, 1.4) * 0.38;
        const z = Math.sin(progress * Math.PI) * (targetX === 0 ? 0.12 : 0.06);

        return { x, y, z };
      } else if (i < 950) {
        // 5 Taper Candles
        const idx = i - 750;
        const candNum = idx % 5;
        const candXTargets = [0, -0.34, 0.34, -0.65, 0.65];
        const candX = candXTargets[candNum];
        const candYBase = candX === 0 ? 0.38 : Math.abs(candX) === 0.34 ? 0.32 : 0.25;

        const h = Math.random() * 0.28;
        const r = 0.038;
        const a = Math.random() * Math.PI * 2;

        return {
          x: candX + r * Math.cos(a),
          y: candYBase + h,
          z: r * Math.sin(a)
        };
      } else if (i < 1050) {
        // 5 Glowing Teardrop Candle Flames
        const idx = i - 950;
        const flameNum = idx % 5;
        const flameXTargets = [0, -0.34, 0.34, -0.65, 0.65];
        const flameX = flameXTargets[flameNum];
        const candYBase = flameX === 0 ? 0.38 : Math.abs(flameX) === 0.34 ? 0.32 : 0.25;
        const flameYBase = candYBase + 0.28;

        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 0.5;
        const r = 0.06 * Math.cos(v);
        const fy = flameYBase + Math.sin(v) * 0.16;

        return {
          x: flameX + r * Math.cos(u),
          y: fy,
          z: r * Math.sin(u)
        };
      } else if (i < 1920) {
        // LEFT SPEAKER / BAFFLE (x ~ -1.22)
        const idx = i - 1050;
        const cx = -1.22;

        if (idx < 320) {
          // Speaker Cabinet Enclosure Frame (Box outline)
          const sideX = cx + (Math.random() - 0.5) * 0.52;
          const sideY = -0.15 + (Math.random() - 0.5) * 1.35;
          const sideZ = (Math.random() - 0.5) * 0.42;
          return { x: sideX, y: sideY, z: sideZ };
        } else if (idx < 500) {
          // Upper Tweeter Cone (Concentric Ring)
          const sub = idx - 320;
          const a = (sub / 180) * Math.PI * 2;
          const r = 0.15;
          return {
            x: cx + r * Math.cos(a),
            y: 0.32 + r * Math.sin(a),
            z: 0.18
          };
        } else {
          // Lower Sub-Woofer Cone (Large Concentric Rings)
          const sub = idx - 500;
          const ringIdx = sub % 3;
          const r = 0.12 + ringIdx * 0.11;
          const a = Math.random() * Math.PI * 2;
          return {
            x: cx + r * Math.cos(a),
            y: -0.22 + r * Math.sin(a),
            z: 0.18 + (0.35 - r) * 0.3
          };
        }
      } else if (i < 2350) {
        // RIGHT SPEAKER / BAFFLE (Symmetric at x ~ +1.22)
        const idx = i - 1720;
        const cx = 1.22;

        if (idx < 220) {
          // Speaker Cabinet Enclosure Frame
          const sideX = cx + (Math.random() - 0.5) * 0.52;
          const sideY = -0.15 + (Math.random() - 0.5) * 1.35;
          const sideZ = (Math.random() - 0.5) * 0.42;
          return { x: sideX, y: sideY, z: sideZ };
        } else if (idx < 380) {
          // Upper Tweeter Cone
          const sub = idx - 220;
          const a = (sub / 160) * Math.PI * 2;
          const r = 0.15;
          return {
            x: cx + r * Math.cos(a),
            y: 0.32 + r * Math.sin(a),
            z: 0.18
          };
        } else {
          // Lower Sub-Woofer Cone
          const sub = idx - 380;
          const ringIdx = sub % 3;
          const r = 0.12 + ringIdx * 0.11;
          const a = Math.random() * Math.PI * 2;
          return {
            x: cx + r * Math.cos(a),
            y: -0.22 + r * Math.sin(a),
            z: 0.18 + (0.35 - r) * 0.3
          };
        }
      } else {
        // Ambient sparkling particles floating around Chandelier & Baffles
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dist = 0.85 + Math.random() * 1.35;
        return {
          x: dist * Math.sin(phi) * Math.cos(theta),
          y: dist * Math.sin(phi) * Math.sin(theta) * 0.75,
          z: dist * Math.cos(phi)
        };
      }
    };

    for (let i = 0; i < COUNT; i++) {
      const g = getGalaxyPos(i);
      const c = getCrossPos(i);
      const h = getHeadphonePos(i);
      const ch = getChandelierPos(i);

      pts.push({
        x: g.x,
        y: g.y,
        z: g.z,
        galaxy: g,
        cross: c,
        headphone: h,
        chandelier: ch,
        size: Math.random() * 1.5 + 0.9,
        freqIdx: Math.floor(Math.random() * 32),
        baseAlpha: Math.random() * 0.4 + 0.6,
        colorType: i < 800 ? 'core' : i < 1600 ? 'ring' : i < 2200 ? 'arm' : 'fabric'
      });
    }

    return pts;
  }, []);

  // Main Morphing 3D Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    let angleX = 0;
    let targetAngleY = 0;
    let targetAngleX = 0;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = Math.min(480, Math.max(300, width * 0.45));

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = parseFloat(canvas.style.width) || canvas.width;
      const height = parseFloat(canvas.style.height) || canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Rotation angles
      if (touchRef.current.active) {
        targetAngleY = touchRef.current.rx * 1.5;
        targetAngleX = touchRef.current.ry * 0.6;
      } else {
        targetAngleY += isPlaying ? 0.008 : 0.004;
        targetAngleX = Math.sin(Date.now() * 0.001) * 0.08;
      }

      angleY += (targetAngleY - angleY) * 0.08;
      angleX += (targetAngleX - angleX) * 0.08;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.28;

      // Audio Frequency Data
      let freqData: Uint8Array | null = null;
      if (isPlaying) {
        freqData = audioEngine.getFrequencyData();
      }

      const touch = touchRef.current;
      const touchRadius = 110;

      const transformedPts = [];

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Smooth Morphing interpolation towards active shape target
        const target = pt[activeShape];
        pt.x += (target.x - pt.x) * 0.06;
        pt.y += (target.y - pt.y) * 0.06;
        pt.z += (target.z - pt.z) * 0.06;

        // Audio displacement
        let freqVal = 0;
        if (freqData && freqData.length > 0) {
          const val = freqData[pt.freqIdx % freqData.length] || 0;
          freqVal = val / 255;
        } else if (isPlaying) {
          freqVal = (Math.sin(Date.now() * 0.005 + pt.freqIdx) + 1) * 0.5;
        }

        const audioDisplacement = freqVal * 0.08;
        const curX = pt.x * (1 + audioDisplacement);
        const curY = pt.y * (1 + audioDisplacement);
        const curZ = pt.z * (1 + audioDisplacement);

        // 3D Rotations
        const x1 = curX * cosY - curZ * sinY;
        const z1 = curX * sinY + curZ * cosY;
        const y2 = curY * cosX - z1 * sinX;
        const z2 = curY * sinX + z1 * cosX;

        const fov = 3.2;
        const pScale = fov / (fov + z2);
        let px = centerX + x1 * scale * pScale;
        let py = centerY - y2 * scale * pScale;

        // Interactive Touch Repulsion / Ripple Reaction
        let touchForce = 0;
        if (touch.active) {
          const dx = px - touch.x;
          const dy = py - touch.y;
          const touchDist = Math.sqrt(dx * dx + dy * dy);

          if (touchDist < touchRadius) {
            touchForce = 1 - touchDist / touchRadius;
            const pushAmt = touchForce * 26;
            const angle = Math.atan2(dy, dx);
            px += Math.cos(angle) * pushAmt;
            py += Math.sin(angle) * pushAmt;
          }
        }

        transformedPts.push({
          px, py, z: z2,
          size: pt.size * pScale * (1 + touchForce * 0.6),
          baseAlpha: pt.baseAlpha,
          freqVal,
          colorType: pt.colorType,
          touchForce
        });
      }

      // Sort by Z depth
      transformedPts.sort((a, b) => a.z - b.z);

      // Render 3D Point Cloud
      for (let i = 0; i < transformedPts.length; i++) {
        const pt = transformedPts[i];
        const depthAlpha = Math.max(0.15, Math.min(1, (pt.z + 1.2) / 2.4));
        const alpha = Math.min(1, pt.baseAlpha * depthAlpha + pt.freqVal * 0.4 + pt.touchForce * 0.4);

        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);

        if (pt.touchForce > 0) {
          ctx.fillStyle = `rgba(9, 9, 11, ${Math.min(1, alpha * 1.3)})`;
        } else if (pt.colorType === 'core') {
          ctx.fillStyle = `rgba(15, 15, 20, ${alpha})`;
        } else if (pt.colorType === 'ring') {
          ctx.fillStyle = `rgba(35, 35, 45, ${alpha * 0.9})`;
        } else if (pt.colorType === 'arm') {
          ctx.fillStyle = `rgba(60, 60, 75, ${alpha * 0.85})`;
        } else {
          ctx.fillStyle = `rgba(100, 100, 120, ${alpha * 0.7})`;
        }

        ctx.fill();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [particles, activeShape, isPlaying]);

  // Pointer & Touch handlers
  const updatePointerState = (clientX: number, clientY: number, active: boolean) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    touchRef.current.x = x;
    touchRef.current.y = y;
    touchRef.current.active = active;
    touchRef.current.rx = (x / rect.width - 0.5) * 2;
    touchRef.current.ry = (y / rect.height - 0.5) * 2;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    touchRef.current.isDown = true;
    updatePointerState(e.clientX, e.clientY, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePointerState(e.clientX, e.clientY, true);
  };

  const handlePointerUp = () => {
    touchRef.current.isDown = false;
    touchRef.current.active = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerState(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerState(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  };

  const handleTouchEnd = () => {
    touchRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full my-2 overflow-hidden select-none"
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-[300px] sm:h-[380px] md:h-[440px] cursor-grab active:cursor-grabbing block touch-none"
      />

      {/* Discreet Controls Below Canvas: Audio Trigger + Shape Selector Tabs */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-neutral-500 font-mono-code">
        {/* Audio Trigger */}
        <div className="flex items-center gap-2.5 max-w-[60%] sm:max-w-none">
          <button
            onClick={togglePlayPause}
            className="w-7 h-7 rounded-full bg-[#7A1C28] hover:bg-[#61141F] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
            aria-label={isPlaying ? "Mettre en pause" : "Activer la fréquence sonore"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-white" />
            ) : (
              <Play className="w-3 h-3 fill-white ml-0.5" />
            )}
          </button>
          <span className="truncate text-[10px] sm:text-xs text-neutral-600">
            {currentTrack?.title} {isPlaying ? "· 432Hz Audio" : ""}
          </span>
        </div>

        {/* 3D Shape Navigation Controls: strictly the 2 manual dark grey buttons */}
        <div className="flex items-center gap-1.5">
          {/* Manual Previous Button */}
          <button
            onClick={handlePrevShape}
            aria-label="Forme 3D précédente"
            title="Forme 3D précédente"
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Manual Next Button */}
          <button
            onClick={handleNextShape}
            aria-label="Forme 3D suivante"
            title="Forme 3D suivante"
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
