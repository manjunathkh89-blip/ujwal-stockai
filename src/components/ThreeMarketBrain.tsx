import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMarketBrainProps {
  activeRegime?: string;
  onSelectNode?: (nodeName: string) => void;
}

export const ThreeMarketBrain: React.FC<ThreeMarketBrainProps> = ({
  activeRegime = 'TRANSITION',
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a0f, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting (Warm directional key + cool hemisphere fill)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050811, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 2.0);
    dirLight.position.set(4, 6, 5);
    scene.add(dirLight);

    const dirLightFill = new THREE.DirectionalLight(0xa855f7, 1.0);
    dirLightFill.position.set(-5, -3, -3);
    scene.add(dirLightFill);

    // Root Group
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // 1. Central Core Composite (3 parts: Icosahedron inner core + dual metallic gyro rings)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    brainGroup.add(coreMesh);

    // Outer wireframe cage for core
    const cageGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    brainGroup.add(cageMesh);

    // Dual rotating metallic gyro rings
    const ringGeo1 = new THREE.TorusGeometry(1.4, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    brainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.65, 0.015, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    brainGroup.add(ring2);

    // 2. Peripheral Neural Sub-Engine Nodes
    const nodeDefs = [
      { name: 'Technical AI', color: 0x10b981, pos: [2.5, 0.8, 0.5] },
      { name: 'Fundamental AI', color: 0x06b6d4, pos: [-2.4, 1.0, 0.3] },
      { name: 'News & Sentiment', color: 0xf59e0b, pos: [1.8, -1.5, 0.8] },
      { name: 'Market Regime', color: 0xa855f7, pos: [-2.0, -1.2, 0.6] },
      { name: 'Macro Indices', color: 0x3b82f6, pos: [0.0, 2.3, -0.6] },
      { name: 'Risk & Scandals', color: 0xf43f5e, pos: [0.0, -2.2, -0.5] },
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const lineGeometries: THREE.BufferGeometry[] = [];

    nodeDefs.forEach((def) => {
      // Node sub-assembly: Octahedron + outer glow ring
      const nodeGeo = new THREE.OctahedronGeometry(0.38, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      nodeMesh.userData = { name: def.name };
      brainGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);

      // Connecting neural filament to center
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(def.pos[0], def.pos[1], def.pos[2]),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      lineGeometries.push(lineGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      brainGroup.add(line);
    });

    // 3. Floating Neural Particles (150 data points)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    brainGroup.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0 && onSelectNode) {
        const selected = intersects[0].object.userData.name;
        if (selected) {
          onSelectNode(selected);
        }
      }
    };

    container.addEventListener('click', onClick);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 340;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop with Damping
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damped mouse orientation
      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.5;

      brainGroup.rotation.y += (targetRotationY - brainGroup.rotation.y) * 0.05 + 0.003;
      brainGroup.rotation.x += (targetRotationX - brainGroup.rotation.x) * 0.05;

      // Rotating inner components
      coreMesh.rotation.y = elapsedTime * 0.4;
      coreMesh.rotation.x = elapsedTime * 0.2;
      cageMesh.rotation.y = -elapsedTime * 0.3;
      ring1.rotation.z = elapsedTime * 0.5;
      ring2.rotation.z = -elapsedTime * 0.4;

      // Pulse peripheral nodes
      nodeMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = elapsedTime * (0.8 + idx * 0.1);
        mesh.rotation.x = elapsedTime * (0.5 + idx * 0.05);
        const scale = 1 + Math.sin(elapsedTime * 2 + idx) * 0.08;
        mesh.scale.set(scale, scale, scale);
      });

      // Pulse particles
      particleSystem.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);

      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeometries.forEach((g) => g.dispose());
      nodeMeshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material.dispose();
        }
      });

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectNode]);

  return (
    <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-gradient-to-b from-[#0a0f18] to-[#070a0f] border border-slate-800/80 shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Overlay */}
      <div className="absolute top-3 left-4 pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            AI MARKET BRAIN · NEURAL SYNTHESIS 2026
          </span>
        </div>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
          Active Multi-Engine Fusion: Technicals · Fundamentals · News · Sentiment · Macro
        </p>
      </div>

      <div className="absolute top-3 right-4 pointer-events-none select-none">
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900/90 text-cyan-300 border border-slate-800 shadow">
          REGIME: <strong className="text-white font-bold">{activeRegime}</strong>
        </span>
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-500 pointer-events-none select-none">
        <span>Click any peripheral node or drag to rotate 3D neural matrix</span>
        <span>6 Engine Pillars · Continuous Verification</span>
      </div>
    </div>
  );
};
