import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  // Current elapsed time in seconds (0.00 to 5.00)
  const [elapsed, setElapsed] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 5-Second Precision High-Resolution Timeline Loop
  useEffect(() => {
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const timeInSec = (now - startTime) / 1000;
      setElapsed(Math.min(5.0, timeInSec));

      if (timeInSec >= 4.0 && !isFadingOut) {
        setIsFadingOut(true);
      }

      if (timeInSec >= 5.0) {
        // Exactly 5 seconds reached
        onComplete();
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [onComplete, isFadingOut]);

  // Three.js 3D Financial Network & Light Sweep Environment
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a0f, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 1. Perspective Financial Market Floor Grid
    const gridHelper = new THREE.GridHelper(30, 40, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    scene.add(gridHelper);

    // 2. Global Financial Network Sphere (Icosahedron Wireframe + Coordinates)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 3. Orbital Latitude Financial Rings
    const ringGeo1 = new THREE.RingGeometry(2.5, 2.52, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.9, 2.92, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    globeGroup.add(ring2);

    // 4. Floating 3D Financial Nodes & Particles
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;

      // Color mix: Cyan, Emerald, Silver/White
      const rand = Math.random();
      if (rand > 0.6) {
        // Emerald
        particleColors[i] = 0.06;
        particleColors[i + 1] = 0.72;
        particleColors[i + 2] = 0.5;
      } else if (rand > 0.3) {
        // Cyan
        particleColors[i] = 0.05;
        particleColors[i + 1] = 0.65;
        particleColors[i + 2] = 0.95;
      } else {
        // Silver / White
        particleColors[i] = 0.85;
        particleColors[i + 1] = 0.9;
        particleColors[i + 2] = 0.95;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Candlestick Trace Bars (3D Vertical Micro-Cylinders)
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);
    const candleCount = 18;
    const cylinderGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.5 });

    for (let i = 0; i < candleCount; i++) {
      const isGreen = Math.random() > 0.35;
      const mesh = new THREE.Mesh(cylinderGeo, isGreen ? greenMat : redMat);
      mesh.position.set(
        (i - candleCount / 2) * 0.65,
        Math.sin(i * 0.6) * 0.8 - 0.5,
        (Math.random() - 0.5) * 3
      );
      candleGroup.add(mesh);
    }

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const lightSweep = new THREE.PointLight(0x38bdf8, 3, 20);
    lightSweep.position.set(-8, 3, 4);
    scene.add(lightSweep);

    const emeraldLight = new THREE.PointLight(0x10b981, 2, 15);
    emeraldLight.position.set(5, -2, 3);
    scene.add(emeraldLight);

    // Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Camera dolly push inward (cinematic feel)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.8, 0.02);

      // Rotate globe and orbital rings
      globeGroup.rotation.y = time * 0.15;
      globeGroup.rotation.x = Math.sin(time * 0.1) * 0.1;
      ring1.rotation.z = time * 0.2;
      ring2.rotation.z = -time * 0.15;

      // Particles gentle drift
      particles.rotation.y = time * 0.03;

      // Market grid motion
      gridHelper.position.z = (time * 0.8) % 1;

      // Candlesticks subtle wave
      candleGroup.children.forEach((c, idx) => {
        c.position.y += Math.sin(time * 2 + idx) * 0.002;
      });

      // Light sweep traversing across screen (0 to 1.5 seconds)
      lightSweep.position.x = -8 + time * 4.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      cylinderGeo.dispose();
      greenMat.dispose();
      redMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 250);
  };

  return (
    <aside
      aria-label="Application Startup"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a0f] text-slate-100 overflow-hidden select-none transition-all duration-1000 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D WebGL Canvas Layer */}
      <div ref={canvasContainerRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Atmospheric Dark Intelligence Vignette & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.12)_0%,rgba(7,10,15,0.78)_60%,rgba(7,10,15,0.98)_100%)] pointer-events-none z-1" />

      {/* 0-1s Premium Light Sweep Shimmer Line */}
      {elapsed < 1.6 && (
        <div
          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-xl pointer-events-none transform -skew-x-12 z-2 transition-transform duration-1000"
          style={{
            left: `${(elapsed / 1.5) * 110}%`,
          }}
        />
      )}

      {/* Main Content Choreography Container */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        {/* PHASE 0 (0-1s): Subtle Pre-Initialization Telegraph */}
        {elapsed < 1.0 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono tracking-[0.35em] text-cyan-400/80 uppercase">
                Establishing Neural Telemetry
              </span>
            </div>
          </div>
        )}

        {/* PHASE 1 (1-2s): Reveal Main Title with Metallic Depth */}
        {elapsed >= 1.0 && elapsed < 2.0 && (
          <div className="space-y-3 animate-fade-in transition-all duration-700 transform">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next-Gen Institutional Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                GLOBAL AI MARKET INTELLIGENCE
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider">
              Autonomous Surveillance across Global Exchanges
            </p>
          </div>
        )}

        {/* PHASE 2 (2-3s): Smooth Transition into Developer Attribution */}
        {elapsed >= 2.0 && elapsed < 3.0 && (
          <div className="space-y-3 animate-fade-in transition-all duration-700">
            <div className="text-xs font-mono uppercase tracking-[0.35em] text-slate-400">
              Architecture & Quantitative Engineering
            </div>

            <div className="text-sm sm:text-base font-light text-slate-300 tracking-widest uppercase">
              Developed by
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold font-mono tracking-tight text-white drop-shadow-[0_4px_15px_rgba(16,185,129,0.3)]">
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Manjunath KH
              </span>
            </h2>

            <div className="text-[11px] font-mono text-slate-500 tracking-widest pt-1">
              SYSTEM ENGINE v2026.4
            </div>
          </div>
        )}

        {/* PHASE 3 (3-4s): AI-Processing Sequence (No fake percentages) */}
        {elapsed >= 3.0 && elapsed < 4.0 && (
          <div className="space-y-4 animate-fade-in transition-all duration-500">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
              Synchronizing High-Frequency Matrix
            </div>

            {/* 4 Pillars initialized simultaneously */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
              <div className="bg-[#0b0f17]/90 border border-emerald-500/50 p-2.5 rounded-lg text-left space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide">
                    AI MARKET ENGINE
                  </span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 block">
                  READY · ACTIVE
                </span>
              </div>

              <div className="bg-[#0b0f17]/90 border border-cyan-500/50 p-2.5 rounded-lg text-left space-y-1 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide">
                    GLOBAL DATA
                  </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 block">
                  8 EXCHANGES VERIFIED
                </span>
              </div>

              <div className="bg-[#0b0f17]/90 border border-purple-500/50 p-2.5 rounded-lg text-left space-y-1 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide">
                    RISK INTELLIGENCE
                  </span>
                </div>
                <span className="text-[9px] font-mono text-purple-400 block">
                  COVARIANCE 0.84
                </span>
              </div>

              <div className="bg-[#0b0f17]/90 border border-amber-500/50 p-2.5 rounded-lg text-left space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide">
                    REAL-TIME ANALYSIS
                  </span>
                </div>
                <span className="text-[9px] font-mono text-amber-400 block">
                  STREAM ONLINE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 4 (4-5s): Seamless Dissolve into Main Dashboard */}
        {elapsed >= 4.0 && (
          <div className="space-y-2 animate-fade-in transition-all duration-700">
            <div className="text-xs font-mono tracking-[0.25em] text-emerald-400 uppercase">
              Command Center Initialized
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Transitioning into Global Intelligence Stream...
            </div>
          </div>
        )}
      </div>

      {/* Subtle Skip Option */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-md border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800"
      >
        Skip Intro →
      </button>

      {/* Subtle Precision Timeline Bar (Minimal line at bottom) */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-slate-900 z-20">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-300 transition-all duration-75 ease-linear"
          style={{ width: `${(elapsed / 5.0) * 100}%` }}
        />
      </div>
    </aside>
  );
};
