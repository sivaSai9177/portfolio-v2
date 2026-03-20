import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Mockup textures for floating screens in hero
const SCREEN_IMAGES = [
  'assets/work/mockups/mockup-dashboard-dark.png',
  'assets/work/mockups/mockup-analytics-dark.png',
  'assets/work/mockups/mockup-devices-clay.png',
];

// Global amber accent — matches site palette
const ACCENT = 0xf5a623;
const ACCENT_DIM = 0x7a5312;

export default function HeroThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(ACCENT, 2, 20);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);
    const rimLight = new THREE.PointLight(0x004466, 1.5, 15);
    rimLight.position.set(-3, -1, 3);
    scene.add(rimLight);

    // ── Shield group (parent for tilt) ──
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // ── Hexagonal shield frame (wireframe) ──
    const hexShape = new THREE.Shape();
    const hexR = 1.6;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = hexR * Math.cos(angle);
      const y = hexR * Math.sin(angle);
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const hexGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    const hexWire = new THREE.MeshBasicMaterial({
      color: ACCENT,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const hexMesh = new THREE.Mesh(hexGeo, hexWire);
    hexMesh.position.z = -0.075;
    shieldGroup.add(hexMesh);

    // Inner solid hex (subtle fill)
    const innerHexMat = new THREE.MeshPhongMaterial({
      color: ACCENT_DIM,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const innerHexGeo = new THREE.ShapeGeometry(hexShape);
    const innerHex = new THREE.Mesh(innerHexGeo, innerHexMat);
    shieldGroup.add(innerHex);

    // ── Glowing edge ring ──
    const ringGeo = new THREE.TorusGeometry(1.75, 0.02, 8, 6);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    shieldGroup.add(ring);

    // ── Floating dashboard screens ──
    const screenMeshes: THREE.Mesh[] = [];
    const textureLoader = new THREE.TextureLoader();
    const screenGeo = new THREE.PlaneGeometry(1.4, 0.9);

    SCREEN_IMAGES.forEach((src, i) => {
      const texture = textureLoader.load(src);
      texture.encoding = THREE.sRGBEncoding;
      const mat = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0.05,
      });
      const mesh = new THREE.Mesh(screenGeo, mat);

      // Position screens in orbit
      const angle = ((Math.PI * 2) / 3) * i + Math.PI / 6;
      const orbitR = 2.2;
      mesh.position.set(
        orbitR * Math.cos(angle),
        orbitR * Math.sin(angle) * 0.5,
        0.3 + i * 0.15
      );
      mesh.rotation.y = -angle * 0.2;

      // Add subtle border glow plane behind each screen
      const borderGeo = new THREE.PlaneGeometry(1.48, 0.98);
      const borderMat = new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.z = -0.01;
      mesh.add(border);

      shieldGroup.add(mesh);
      screenMeshes.push(mesh);
    });

    // ── Particle glow nodes ──
    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.5 + Math.random() * 1.0;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      particlePositions[i * 3 + 2] = r * Math.cos(phi) * 0.3;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    shieldGroup.add(particles);

    // ── Vertex glow nodes at hex corners ──
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.9,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(hexR * Math.cos(angle), hexR * Math.sin(angle), 0.08);
      node.userData.baseOpacity = 0.9;
      node.userData.pulseOffset = i * 0.5;
      shieldGroup.add(node);
    }

    // ── Resize handler ──
    function resize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // ── Mouse tracking ──
    function onMouseMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    container.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ──
    let time = 0;
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.008;

      // Auto-rotate + mouse tilt
      const targetRotY = time * 0.3 + mouseRef.current.x * 0.2;
      const targetRotX = mouseRef.current.y * 0.15;
      shieldGroup.rotation.y += (targetRotY - shieldGroup.rotation.y) * 0.03;
      shieldGroup.rotation.x += (targetRotX - shieldGroup.rotation.x) * 0.05;

      // Floating Y
      shieldGroup.position.y = Math.sin(time * 1.2) * 0.12;

      // Orbit screens around shield
      screenMeshes.forEach((mesh, i) => {
        const angle = ((Math.PI * 2) / 3) * i + time * 0.4;
        const orbitR = 2.1 + Math.sin(time * 0.8 + i) * 0.15;
        mesh.position.x = orbitR * Math.cos(angle);
        mesh.position.y = orbitR * Math.sin(angle) * 0.45 + Math.sin(time * 1.5 + i * 2) * 0.08;
        mesh.position.z = 0.25 + Math.sin(time + i) * 0.1;
        mesh.rotation.y = -angle * 0.15;
        // Subtle opacity pulse
        (mesh.material as THREE.MeshPhongMaterial).opacity = 0.75 + Math.sin(time * 2 + i) * 0.1;
      });

      // Pulse vertex nodes
      shieldGroup.children.forEach((child) => {
        if (child.userData.baseOpacity !== undefined) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity =
            child.userData.baseOpacity * (0.5 + 0.5 * Math.sin(time * 3 + child.userData.pulseOffset));
        }
      });

      // Pulse ring
      ringMat.opacity = 0.25 + Math.sin(time * 2) * 0.1;

      // Rotate particles slowly
      particles.rotation.z = time * 0.1;
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);
    }
    animate();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onMouseMove);

      // Dispose Three.js resources
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="sc-hero-3d-container">
      <canvas ref={canvasRef} className="sc-hero-3d-canvas" />
    </div>
  );
}
