import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { initLandMask, isLandPoint } from '../../lib/landMask';

// Extend window interface for Three.js globals
declare global {
  interface Window {
    threeShapeMaterials?: THREE.Material[];
    threeShapeGroups?: {
      bright: THREE.Mesh[];
      normal: THREE.Mesh[];
      dim: THREE.Mesh[];
    };
    threeCursorShape?: THREE.Mesh;
    threeTrail?: Array<{ mesh: THREE.Mesh; pos: { x: number; y: number } }>;
    threeGlobeMaterials?: {
      dots: THREE.ShaderMaterial;
      shield: THREE.ShaderMaterial;
      sunlight: THREE.ShaderMaterial;
      rings: THREE.MeshBasicMaterial[];
      stars: THREE.ShaderMaterial;
    };
    threeForceRender?: () => void;
    updateThreeMaterials?: (theme: string) => void;
  }
}

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof THREE === 'undefined') return;

    // Initialize the pixel-accurate land mask (must happen before dot generation)
    initLandMask();

    const isMobile = window.innerWidth < 768;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = isMobile ? 26 : 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // =============================================
    //  GLOBE: Dotted world map sphere
    // =============================================
    const GLOBE_RADIUS = isMobile ? 11 : 15;
    const DOT_COUNT = isMobile ? 6000 : 12000;

    // Two nested groups: pivot (mouse tilt) > spin (auto-rotation Y)
    const globePivot = new THREE.Group();
    const globeSpin = new THREE.Group();
    globePivot.add(globeSpin);
    scene.add(globePivot);

    // Offset globe downward — space below nav, globe in lower portion
    // On mobile, keep globe more centered in the viewport
    globePivot.position.y = isMobile ? -2 : -5;

    // Generate globe dots via Fibonacci sphere
    const dotPositions = [];
    const dotAlphas = [];
    const dotSizes = [];
    const dotGlows = [];
    const PHI = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < DOT_COUNT; i++) {
      const theta = (2 * Math.PI * i) / PHI;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / DOT_COUNT);

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      const lat = 90 - (phi * 180) / Math.PI;
      const lng = ((theta * 180) / Math.PI) % 360 - 180;
      const land = isLandPoint(lat, lng);

      if (land) {
        dotPositions.push(x, y, z);
        // ~20% glow with accent color, rest are visible but dim
        if (Math.random() < 0.2) {
          // Glowing dot — full accent color
          dotAlphas.push(0.55 + Math.random() * 0.3);
          dotSizes.push(1.0 + Math.random() * 0.2);
          dotGlows.push(1.0);
        } else {
          // Dim dot — visible but muted
          dotAlphas.push(0.38 + Math.random() * 0.12);
          dotSizes.push(0.9);
          dotGlows.push(0.0);
        }
      } else if (Math.random() < 0.05) {
        dotPositions.push(x, y, z);
        dotAlphas.push(0.08);
        dotSizes.push(0.4);
        dotGlows.push(0.0);
      }
    }

    const globeGeo = new THREE.BufferGeometry();
    globeGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    globeGeo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(dotAlphas, 1));
    globeGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(dotSizes, 1));
    globeGeo.setAttribute('aGlow', new THREE.Float32BufferAttribute(dotGlows, 1));

    const globeDotMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xf5a623) },
        uDimColor: { value: new THREE.Color(0x3a3a4a) },
        uOpacity: { value: 1.0 },
      },
      vertexShader: [
        'attribute float aAlpha;',
        'attribute float aSize;',
        'attribute float aGlow;',
        'varying float vAlpha;',
        'varying float vGlow;',
        'void main() {',
        '  vAlpha = aAlpha;',
        '  vGlow = aGlow;',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * (260.0 / -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform vec3 uDimColor;',
        'uniform float uOpacity;',
        'varying float vAlpha;',
        'varying float vGlow;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float strength = 1.0 - smoothstep(0.15, 0.5, d);',
        '  vec3 dotColor = mix(uDimColor, uColor, vGlow);',
        '  gl_FragColor = vec4(dotColor, vAlpha * strength * uOpacity);',
        '}',
      ].join('\n'),
      transparent: true,
      depthWrite: false,
    });

    const globeDots = new THREE.Points(globeGeo, globeDotMat);
    globeSpin.add(globeDots);

    // =============================================
    //  ATMOSPHERIC SHIELD — outer glow at globe silhouette
    // =============================================
    const shieldMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xf5a623) },
        uOpacity: { value: 1.0 },
      },
      vertexShader: [
        'varying float vIntensity;',
        'void main() {',
        '  vec3 vNormal = normalize(normalMatrix * normal);',
        '  vec3 vView = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);',
        '  float rim = 1.0 + dot(vNormal, vView);',
        '  vIntensity = pow(clamp(rim, 0.0, 1.0), 4.5);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying float vIntensity;',
        'void main() {',
        '  gl_FragColor = vec4(uColor, vIntensity * 0.7 * uOpacity);',
        '}',
      ].join('\n'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.06, 64, 64),
      shieldMat
    );
    globeSpin.add(shieldMesh);

    // Sunlight highlight — white glow on upper portion of shield
    const sunlightMat = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      vertexShader: [
        'varying float vIntensity;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '  vec3 vNormal = normalize(normalMatrix * normal);',
        '  vec3 vView = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);',
        '  float rim = 1.0 + dot(vNormal, vView);',
        '  vIntensity = pow(clamp(rim, 0.0, 1.0), 2.5);',
        '  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform float uOpacity;',
        'varying float vIntensity;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '  vec3 nPos = normalize(vWorldPos);',
        '  vec3 sunDir = normalize(vec3(0.5, 0.8, 0.3));',
        '  float spec = pow(max(dot(nPos, sunDir), 0.0), 12.0);',
        '  float sunGlow = vIntensity * spec * 0.75 * uOpacity;',
        '  gl_FragColor = vec4(1.0, 1.0, 1.0, sunGlow);',
        '}',
      ].join('\n'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const sunlightMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.03, 64, 64),
      sunlightMat
    );
    globeSpin.add(sunlightMesh);

    // =============================================
    //  ORBITAL RINGS
    // =============================================
    const rings: THREE.Mesh[] = [];
    const ringMaterials: THREE.MeshBasicMaterial[] = [];

    if (!isMobile) {
      const ringConfigs = [
        { radius: GLOBE_RADIUS * 1.25, tiltX: 1.2, tiltZ: 0.3, opacity: 0.12, tube: 0.018 },
        { radius: GLOBE_RADIUS * 1.45, tiltX: -0.4, tiltZ: 0.5, opacity: 0.08, tube: 0.012 },
        { radius: GLOBE_RADIUS * 1.65, tiltX: 0.8, tiltZ: -0.2, opacity: 0.05, tube: 0.008 },
      ];

      ringConfigs.forEach(function (cfg) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xf5a623,
          transparent: true,
          opacity: cfg.opacity,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 128),
          mat
        );
        ring.rotation.x = cfg.tiltX;
        ring.rotation.z = cfg.tiltZ;
        (ring.userData as any).baseOpacity = cfg.opacity;
        globePivot.add(ring);
        rings.push(ring);
        ringMaterials.push(mat);
      });
    }

    // =============================================
    //  BACKGROUND STARS
    // =============================================
    const STAR_COUNT = isMobile ? 200 : 400;
    const starPositions = [];
    const starSizes = [];
    for (let si = 0; si < STAR_COUNT; si++) {
      const r = 35 + Math.random() * 40;
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      starPositions.push(
        r * Math.sin(sPhi) * Math.cos(sTheta),
        r * Math.sin(sPhi) * Math.sin(sTheta),
        r * Math.cos(sPhi)
      );
      starSizes.push(0.5 + Math.random() * 1.5);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xf5a623) },
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: [
        'attribute float aSize;',
        'uniform float uTime;',
        'varying float vBrightness;',
        'void main() {',
        '  vBrightness = 0.3 + 0.7 * abs(sin(uTime * 0.5 + position.x * 10.0 + position.y * 7.0));',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * (200.0 / -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying float vBrightness;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float strength = 1.0 - smoothstep(0.0, 0.5, d);',
        '  gl_FragColor = vec4(uColor, strength * vBrightness * 0.2 * uOpacity);',
        '}',
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // =============================================
    //  WIREFRAME SHAPES — two layers
    //  Layer 1: Original base shapes (permanent, untouchable)
    //  Layer 2: Dynamic smaller shapes (viewport-aware pool)
    // =============================================

    // ---- Shared materials (3 tiers) ----
    const amberMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.12,
    });
    const amberBrightMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.2,
    });
    const dimMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.06,
    });
    const matOptions = [amberBrightMat, amberMat, amberMat, dimMat];

    // Track all created geometries for cleanup
    const createdGeos: THREE.BufferGeometry[] = [];

    // ---- Physics helper ----
    function addPhysics(mesh: THREE.Mesh, size: number) {
      (mesh.userData as any).originalPos = {
        x: mesh.position.x, y: mesh.position.y, z: mesh.position.z,
      };
      (mesh.userData as any).physics = {
        velocity: { x: 0, y: 0, z: 0 },
        displacement: { x: 0, y: 0, z: 0 },
        stiffness: 0.012 + Math.random() * 0.008,
        damping: 0.91 + Math.random() * 0.04,
        mass: 1 + size * 0.3,
      };
    }

    // ---- Viewport → world-space math ----
    function getWorldBounds() {
      const vFov = (camera.fov * Math.PI) / 180;
      const wh = 2 * Math.tan(vFov / 2) * camera.position.z;
      const ww = wh * camera.aspect;
      return { halfW: ww / 2, halfH: wh / 2 };
    }

    // ---- Seeded random for deterministic attributes ----
    function seededRand(idx: number) {
      let s = idx * 9301 + 49297;
      s = ((s * s) >>> 0) % 233280;
      return s / 233280;
    }

    // =============================================
    //  LAYER 1: Original base shapes (PERMANENT)
    //  Exactly the same geometries, sizes, layout as before
    // =============================================
    const baseGeoFactories = [
      () => new THREE.IcosahedronGeometry(2 + Math.random() * 2.5, 1),
      () => new THREE.OctahedronGeometry(1.5 + Math.random() * 2, 0),
      () => new THREE.TorusKnotGeometry(1 + Math.random() * 1, 0.3 + Math.random() * 0.2, 64, 8),
      () => new THREE.TorusGeometry(1.5 + Math.random() * 1, 0.4 + Math.random() * 0.2, 12, 24),
      () => new THREE.DodecahedronGeometry(1.5 + Math.random() * 1.5, 0),
      () => new THREE.BoxGeometry(1.5 + Math.random(), 1.5 + Math.random(), 1.5 + Math.random()),
      () => new THREE.TetrahedronGeometry(1.5 + Math.random() * 1.2, 0),
      () => new THREE.SphereGeometry(1 + Math.random() * 0.8, 8, 6),
    ];

    const { halfW: initHalfW, halfH: initHalfH } = getWorldBounds();
    // ---- Base shape count: scales aggressively with viewport ----
    // 8 at ≤1200px, +4 per extra 300px of width
    const BASE_MAX_POOL = 40;
    function calcBaseCount(width: number) {
      if (width < 768) return 5;
      const extra = Math.max(0, Math.floor((width - 1200) / 300) * 4);
      return Math.min(BASE_MAX_POOL, 8 + extra);
    }

    const baseShapes: THREE.Mesh[] = [];

    // Pre-allocate base shape pool
    for (let si = 0; si < BASE_MAX_POOL; si++) {
      const geoFn = baseGeoFactories[si % baseGeoFactories.length];
      const geo = geoFn();
      createdGeos.push(geo);
      const mat = matOptions[si % matOptions.length];
      const mesh = new THREE.Mesh(geo, mat);

      mesh.userData = {
        rotSpeed: {
          x: 0.001 + Math.random() * 0.004,
          y: 0.001 + Math.random() * 0.004,
          z: 0.001 + Math.random() * 0.004,
        },
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatAmp: 0.8 + Math.random() * 1.5,
        baseY: 0,
        baseOpacity: mat.opacity,
        opacityScale: 1.0,
      };

      mesh.visible = false;
      scene.add(mesh);
      baseShapes.push(mesh);
    }

    // ---- Distribute base shapes with original golden-angle layout ----
    function distributeBaseShapes(count: number) {
      const { halfW, halfH } = getWorldBounds();

      for (let si = 0; si < BASE_MAX_POOL; si++) {
        const mesh = baseShapes[si];
        if (si >= count) { mesh.visible = false; continue; }

        const angle = si * 2.399963;
        const radius = 0.3 + (si / count) * 0.7;
        const px = Math.cos(angle) * radius * halfW * 0.85;
        const py = Math.sin(angle) * radius * halfH * 0.75;
        const pz = -5 - seededRand(si + 50) * 12;

        mesh.position.set(px, py, pz);
        (mesh.userData as any).baseY = py;
        addPhysics(mesh, 1 + seededRand(si + 60) * 2);
      }
    }

    let activeBaseCount = calcBaseCount(window.innerWidth);
    distributeBaseShapes(activeBaseCount);

    // =============================================
    //  LAYER 2: Dynamic particles (VIEWPORT-AWARE POOL)
    //  Mix of sizes — small, medium, AND bigger particles
    // =============================================

    // 3 tiers of particle geometry factories: small → medium → big
    const particleGeoFactories = [
      // ── Small particles (subtle ambient fill) ──
      () => new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.3, 0),
      () => new THREE.OctahedronGeometry(0.35 + Math.random() * 0.3, 0),
      () => new THREE.TetrahedronGeometry(0.3 + Math.random() * 0.3, 0),
      () => new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0),
      () => new THREE.BoxGeometry(0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2),
      () => new THREE.SphereGeometry(0.25 + Math.random() * 0.2, 6, 4),
      // ── Medium particles (noticeable presence) ──
      () => new THREE.IcosahedronGeometry(0.8 + Math.random() * 0.6, 1),
      () => new THREE.OctahedronGeometry(0.7 + Math.random() * 0.6, 0),
      () => new THREE.TetrahedronGeometry(0.7 + Math.random() * 0.5, 1),
      () => new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.5, 0),
      () => new THREE.TorusGeometry(0.4 + Math.random() * 0.3, 0.1 + Math.random() * 0.08, 8, 16),
      () => new THREE.ConeGeometry(0.4 + Math.random() * 0.3, 0.8 + Math.random() * 0.5, 5),
      () => new THREE.CylinderGeometry(0.25 + Math.random() * 0.15, 0.25 + Math.random() * 0.15, 0.6 + Math.random() * 0.4, 6),
      () => new THREE.RingGeometry(0.3 + Math.random() * 0.2, 0.55 + Math.random() * 0.2, 6),
      // ── Bigger particles (hero-scale floating shapes) ──
      () => new THREE.IcosahedronGeometry(1.2 + Math.random() * 1.0, 1),
      () => new THREE.OctahedronGeometry(1.0 + Math.random() * 1.0, 0),
      () => new THREE.TorusKnotGeometry(0.6 + Math.random() * 0.5, 0.15 + Math.random() * 0.1, 48, 6),
      () => new THREE.TorusGeometry(0.8 + Math.random() * 0.5, 0.2 + Math.random() * 0.12, 8, 20),
      () => new THREE.DodecahedronGeometry(0.9 + Math.random() * 0.8, 0),
      () => new THREE.TetrahedronGeometry(1.0 + Math.random() * 0.8, 0),
      () => new THREE.BoxGeometry(0.8 + Math.random() * 0.6, 0.8 + Math.random() * 0.6, 0.8 + Math.random() * 0.6),
      () => new THREE.SphereGeometry(0.6 + Math.random() * 0.5, 8, 6),
    ];

    // Particle materials — subtler than base, but still visible
    const particleDimMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.04,
    });
    const particleNormalMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.09,
    });
    const particleBrightMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.16,
    });
    const particleMatOptions = [particleBrightMat, particleNormalMat, particleNormalMat, particleDimMat];

    // =============================================
    //  CYBERSECURITY-THEMED GEOMETRY FACTORIES
    // =============================================
    // Shield shape for cyber aesthetics
    function makeShieldGeo(scale: number): THREE.BufferGeometry {
      const s = new THREE.Shape();
      const r = scale;
      s.moveTo(0, r * 1.2);
      s.quadraticCurveTo(r * 0.9, r * 0.9, r * 0.8, 0);
      s.quadraticCurveTo(r * 0.5, -r * 0.8, 0, -r * 1.0);
      s.quadraticCurveTo(-r * 0.5, -r * 0.8, -r * 0.8, 0);
      s.quadraticCurveTo(-r * 0.9, r * 0.9, 0, r * 1.2);
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.15 * scale, bevelEnabled: false });
      createdGeos.push(geo);
      return geo;
    }

    const cyberBaseGeoFactories: Array<() => THREE.BufferGeometry> = [
      () => makeShieldGeo(1.5 + seededRand(Math.random() * 1000) * 1.5),
      () => { const g = new THREE.CylinderGeometry(1.5 + Math.random(), 1.5 + Math.random(), 0.3, 6); createdGeos.push(g); return g; }, // hexagon
      () => { const g = new THREE.OctahedronGeometry(1.5 + Math.random() * 1.5); g.scale(1, 1.5, 1); createdGeos.push(g); return g; }, // diamond
      () => { const g = new THREE.BoxGeometry(1.5 + Math.random(), 1.5 + Math.random(), 1.5 + Math.random()); createdGeos.push(g); return g; }, // data block
      () => { const g = new THREE.CylinderGeometry(1 + Math.random() * 0.8, 1 + Math.random() * 0.8, 0.2, 6); createdGeos.push(g); return g; }, // thin hex
      () => { const g = new THREE.IcosahedronGeometry(1 + Math.random()); createdGeos.push(g); return g; }, // node
    ];

    const cyberDynamicGeoFactories: Array<() => THREE.BufferGeometry> = [
      () => makeShieldGeo(0.4 + seededRand(Math.random() * 1000) * 0.6),
      () => { const g = new THREE.CylinderGeometry(0.5 + Math.random() * 0.4, 0.5 + Math.random() * 0.4, 0.15, 6); createdGeos.push(g); return g; },
      () => { const g = new THREE.OctahedronGeometry(0.4 + Math.random() * 0.6); g.scale(1, 1.4, 1); createdGeos.push(g); return g; },
      () => { const g = new THREE.BoxGeometry(0.5 + Math.random() * 0.4, 0.5 + Math.random() * 0.4, 0.5 + Math.random() * 0.4); createdGeos.push(g); return g; },
      () => { const g = new THREE.CylinderGeometry(0.3 + Math.random() * 0.3, 0.3 + Math.random() * 0.3, 0.1, 6); createdGeos.push(g); return g; },
      () => { const g = new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.4); createdGeos.push(g); return g; },
    ];

    // Dynamic count: dense fill — 8 base, then +8 per 300px beyond 1200
    const DYNAMIC_MAX_POOL = 120;

    function calcDynamicCount(width: number) {
      if (width < 768) return 0;
      if (width <= 1200) return 8;
      const extra = Math.floor((width - 1200) / 300) * 8;
      return Math.min(DYNAMIC_MAX_POOL, 8 + extra);
    }

    const dynamicShapes: THREE.Mesh[] = [];

    for (let si = 0; si < DYNAMIC_MAX_POOL; si++) {
      const geoFn = particleGeoFactories[si % particleGeoFactories.length];
      const geo = geoFn();
      createdGeos.push(geo);
      const mat = particleMatOptions[si % particleMatOptions.length];
      const mesh = new THREE.Mesh(geo, mat);

      // Scale variation — wider range to get visual diversity
      const scale = 0.6 + seededRand(si + 1000) * 1.2;
      mesh.scale.setScalar(scale);

      mesh.userData = {
        rotSpeed: {
          x: 0.0005 + seededRand(si + 1100) * 0.003,
          y: 0.0005 + seededRand(si + 1200) * 0.003,
          z: 0.0003 + seededRand(si + 1300) * 0.002,
        },
        floatSpeed: 0.15 + seededRand(si + 1400) * 0.4,
        floatAmp: 0.3 + seededRand(si + 1500) * 1.0,
        baseY: 0,
        baseOpacity: mat.opacity,
        opacityScale: 0.6,
      };

      mesh.visible = false;
      mesh.frustumCulled = true;
      scene.add(mesh);
      dynamicShapes.push(mesh);
    }

    // ---- Distribute dynamic particles across FULL viewport (grid-jitter + depth-compensated) ----
    // Center exclusion zone — matches content column (~1000px centered)
    // so particles don't clutter the reading area
    function distributeDynamicShapes(activeCount: number) {
      const { halfW, halfH } = getWorldBounds();

      // Content column in world-space: 1000px / windowWidth * fullWorldWidth
      const contentWorldHalfW = (500 / window.innerWidth) * (halfW * 2);
      // Vertical exclusion: ~40% of viewport height (the main reading band)
      const contentWorldHalfH = halfH * 0.4;

      // Aspect-aware grid: cols × rows ≈ activeCount
      const aspect = halfW / halfH;
      const cols = Math.max(1, Math.round(Math.sqrt(activeCount * aspect)));
      const rows = Math.max(1, Math.ceil(activeCount / cols));

      // Overshoot bounds by 15% so particles reach into the far edges
      const spreadW = halfW * 1.15;
      const spreadH = halfH * 1.15;
      const cellW = (spreadW * 2) / cols;
      const cellH = (spreadH * 2) / rows;

      for (let si = 0; si < DYNAMIC_MAX_POOL; si++) {
        const mesh = dynamicShapes[si];

        if (si >= activeCount) {
          mesh.visible = false;
          continue;
        }

        // Z depth first — determines how much we need to widen x/y
        const pz = -2 - seededRand(si + 2200) * 16;

        // Perspective compensation
        const depthScale = camera.position.z / (camera.position.z + pz);

        // Grid position + jitter
        const col = si % cols;
        const row = Math.floor(si / cols);
        const jitterX = (seededRand(si + 2000) - 0.5) * cellW * 0.8;
        const jitterY = (seededRand(si + 2100) - 0.5) * cellH * 0.8;

        let baseX = -spreadW + cellW * (col + 0.5) + jitterX;
        let baseY = -spreadH + cellH * (row + 0.5) + jitterY;

        // ── Center exclusion: push particles out of the content column ──
        const inCenterX = Math.abs(baseX) < contentWorldHalfW;
        const inCenterY = Math.abs(baseY) < contentWorldHalfH;
        if (inCenterX && inCenterY) {
          // Push outward horizontally past the content edge + small buffer
          const sign = baseX >= 0 ? 1 : -1;
          baseX = sign * (contentWorldHalfW + Math.abs(baseX) * 0.5 + cellW * 0.3);
        }

        // Apply depth compensation so screen position matches the grid cell
        const px = baseX * depthScale;
        const py = baseY * depthScale;

        mesh.position.set(px, py, pz);
        (mesh.userData as any).baseY = py;
        addPhysics(mesh, mesh.scale.x);
      }
    }

    // Initial distributions
    let activeDynamicCount = calcDynamicCount(window.innerWidth);
    distributeDynamicShapes(activeDynamicCount);

    // Combine both layers for theme grouping
    const allShapes = [...baseShapes, ...dynamicShapes];

    // Cursor follower (hidden initially)
    const cursorMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cursorShape = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), cursorMat);
    cursorShape.position.set(0, 0, 2);
    cursorShape.visible = false;
    scene.add(cursorShape);

    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const trail: Array<{ mesh: THREE.Mesh; pos: { x: number; y: number } }> = [];
    for (let ti = 0; ti < 5; ti++) {
      const tSize = 0.5 - ti * 0.07;
      const tm = new THREE.Mesh(new THREE.OctahedronGeometry(tSize, 0), trailMat.clone());
      (tm.material as THREE.MeshBasicMaterial).opacity = 0.15 - ti * 0.025;
      tm.position.set(0, 0, 1.5 - ti * 0.3);
      tm.visible = false;
      (tm.userData as any).baseOpacity = (tm.material as THREE.MeshBasicMaterial).opacity;
      scene.add(tm);
      trail.push({ mesh: tm, pos: { x: 0, y: 0 } });
    }

    // Expose materials for theme toggle (base + particle mats)
    window.threeShapeMaterials = [amberMat, amberBrightMat, dimMat, cursorMat, particleDimMat, particleNormalMat, particleBrightMat];
    // Group ALL shapes (base + dynamic) by brightness tier for theme toggling
    function rebuildShapeGroups() {
      const bright: THREE.Mesh[] = [];
      const normal: THREE.Mesh[] = [];
      const dim: THREE.Mesh[] = [];
      allShapes.forEach((s) => {
        const m = s.material;
        if (m === amberBrightMat || m === particleBrightMat) bright.push(s);
        else if (m === amberMat || m === particleNormalMat) normal.push(s);
        else dim.push(s);
      });
      window.threeShapeGroups = { bright, normal, dim };
    }
    rebuildShapeGroups();
    window.threeCursorShape = cursorShape;
    window.threeTrail = trail;
    window.threeGlobeMaterials = {
      dots: globeDotMat,
      shield: shieldMat,
      sunlight: sunlightMat,
      rings: ringMaterials,
      stars: starMat,
    };
    window.threeForceRender = function () {
      renderer.render(scene, camera);
    };

    // =============================================
    //  INPUT TRACKING (Mouse + Touch + Gyroscope)
    // =============================================
    const mouse = { x: 0, y: 0, target: { x: 0, y: 0 } };
    const cursorFollow = { x: 0, y: 0, targetX: 0, targetY: 0 };

    function screenToWorld(mx: number, my: number) {
      const vec = new THREE.Vector3(mx, my, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    }

    // ---- Desktop: mouse ----
    window.addEventListener('mousemove', function (e) {
      mouse.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ---- Mobile: touch drag → feeds into mouse.target for repulsion + trail ----
    let touchActive = false;
    let touchDecayTimer = 0;

    function handleTouchPos(e: TouchEvent) {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      mouse.target.x = (t.clientX / window.innerWidth - 0.5) * 2;
      mouse.target.y = -(t.clientY / window.innerHeight - 0.5) * 2;
      touchActive = true;
      touchDecayTimer = 0;
    }

    const onTouchStart = (e: TouchEvent) => { handleTouchPos(e); };
    const onTouchMove = (e: TouchEvent) => { handleTouchPos(e); };
    const onTouchEnd = () => { touchActive = false; touchDecayTimer = 0; };

    if (isMobile) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    // ---- Mobile: tap impulse → radial push on nearby shapes ----
    interface TapImpulse { x: number; y: number; strength: number; time: number }
    const tapImpulses: TapImpulse[] = [];
    const TAP_IMPULSE_RADIUS = 14;
    const TAP_IMPULSE_STRENGTH = 1.2;
    const TAP_IMPULSE_DURATION = 0.6; // seconds

    let tapStartTime = 0;
    let tapStartX = 0;
    let tapStartY = 0;

    const onTapStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      tapStartTime = performance.now();
      tapStartX = e.touches[0].clientX;
      tapStartY = e.touches[0].clientY;
    };
    const onTapEnd = (e: TouchEvent) => {
      const elapsed = performance.now() - tapStartTime;
      if (elapsed > 300) return; // not a tap (held too long)
      const ct = e.changedTouches[0];
      const dx = ct.clientX - tapStartX;
      const dy = ct.clientY - tapStartY;
      if (Math.sqrt(dx * dx + dy * dy) > 20) return; // moved too far — swipe, not tap

      // Convert tap position to NDC and then world
      const ndcX = (ct.clientX / window.innerWidth - 0.5) * 2;
      const ndcY = -(ct.clientY / window.innerHeight - 0.5) * 2;
      const worldPos = screenToWorld(ndcX, ndcY);
      tapImpulses.push({
        x: worldPos.x,
        y: worldPos.y,
        strength: TAP_IMPULSE_STRENGTH,
        time: TAP_IMPULSE_DURATION,
      });
    };

    if (isMobile) {
      window.addEventListener('touchstart', onTapStart, { passive: true });
      window.addEventListener('touchend', onTapEnd);
    }

    // ---- Mobile: device gyroscope → globe tilt + subtle camera parallax ----
    const gyro = { x: 0, y: 0, active: false };
    let gyroInitX = 0;
    let gyroInitY = 0;
    let gyroCalibrated = false;

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      // Calibrate to initial orientation on first read
      if (!gyroCalibrated) {
        gyroInitX = e.gamma;
        gyroInitY = e.beta;
        gyroCalibrated = true;
      }
      // Clamp to ±30° from initial, map to -1…1
      const rawX = Math.max(-30, Math.min(30, e.gamma - gyroInitX));
      const rawY = Math.max(-30, Math.min(30, e.beta - gyroInitY));
      gyro.x = rawX / 30;
      gyro.y = rawY / 30;
      gyro.active = true;
    };

    if (isMobile && window.DeviceOrientationEvent) {
      // iOS 13+ requires explicit permission request via user gesture
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === 'function') {
        const requestGyro = () => {
          DOE.requestPermission()
            .then((state: string) => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', onDeviceOrientation);
              }
            })
            .catch(() => { /* denied or error — touch still works */ });
          // Only request once
          window.removeEventListener('touchstart', requestGyro);
        };
        // Trigger on first touch (user gesture required)
        window.addEventListener('touchstart', requestGyro, { once: true });
      } else {
        // Android & older iOS — just listen
        window.addEventListener('deviceorientation', onDeviceOrientation);
      }
    }

    // Resize — debounced dynamic shape redistribution + renderer resize
    let resizeRAF = 0;
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Debounce shape redistribution (runs once per rAF)
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => {
        // Re-distribute base shapes (count scales with viewport)
        activeBaseCount = calcBaseCount(window.innerWidth);
        distributeBaseShapes(activeBaseCount);
        // Re-distribute dynamic particles
        activeDynamicCount = calcDynamicCount(window.innerWidth);
        distributeDynamicShapes(activeDynamicCount);
      });
    };
    window.addEventListener('resize', handleResize);

    // =============================================
    //  SCROLL CROSSFADE: Globe → Wireframes
    //  (Direct DOM query — no ScrollTrigger timing issues)
    // =============================================
    let scrollProgress = 0;

    // =============================================
    //  ANIMATION LOOP
    // =============================================
    let time = 0;
    // Initial rotation: India (lng ~78°E) facing camera with aerial tilt
    let globeAutoRotY = 2.93;
    globePivot.rotation.x = -0.3;
    const INFLUENCE_RADIUS = 10;
    const REPEL_STRENGTH = 0.4;

    // Track page state for cybersecurity theme swap
    let lastCyberPage = false;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // ── Scroll crossfade: compute progress from hero section position ──
      // Works on both Home (.hero) and Showcase (.sc-hero) pages
      const heroEl = (document.querySelector('.hero') || document.querySelector('.sc-hero')) as HTMLElement | null;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const heroH = heroEl.offsetHeight;
        // progress 0 → 1 as hero scrolls from top-of-viewport to fully off-screen top
        scrollProgress = Math.max(0, Math.min(1, -rect.top / heroH));
      } else {
        // No hero section found — reset to show globe (e.g. during route transition)
        scrollProgress = 0;
      }

      // ── Cybersecurity page detection ──
      const isCyberPage = !!document.querySelector('.showcase-theme');

      // ── Handle page theme change ──
      if (isCyberPage !== lastCyberPage) {
        lastCyberPage = isCyberPage;
        const col = isCyberPage ? 0x00e5ff : 0xf5a623;

        // Update all shape materials
        [amberMat, amberBrightMat, dimMat, particleDimMat, particleNormalMat, particleBrightMat].forEach(m => {
          m.color.setHex(col);
        });

        // Update cursor + trail
        if (window.threeCursorShape) {
          (window.threeCursorShape.material as THREE.MeshBasicMaterial).color.setHex(col);
        }
        if (window.threeTrail) {
          window.threeTrail.forEach(t => {
            (t.mesh.material as THREE.MeshBasicMaterial).color.setHex(col);
          });
        }

        // Swap base shape geometries
        baseShapes.forEach((shape, i) => {
          const factories = isCyberPage ? cyberBaseGeoFactories : baseGeoFactories;
          const newGeo = factories[i % factories.length]();
          shape.geometry.dispose();
          shape.geometry = newGeo;
        });

        // Swap dynamic shape geometries
        dynamicShapes.forEach((shape, i) => {
          const factories = isCyberPage ? cyberDynamicGeoFactories : particleGeoFactories;
          const newGeo = factories[i % factories.length]();
          shape.geometry.dispose();
          shape.geometry = newGeo;
        });
      }

      // ── Input smoothing (mouse OR touch, with touch decay) ──
      if (isMobile && !touchActive) {
        // When finger lifted, gently decay mouse target back to center
        touchDecayTimer += 0.016;
        if (touchDecayTimer > 0.5) {
          mouse.target.x *= 0.95;
          mouse.target.y *= 0.95;
        }
      }

      mouse.x += (mouse.target.x - mouse.x) * 0.05;
      mouse.y += (mouse.target.y - mouse.y) * 0.05;

      // On mobile with gyro, blend gyroscope into mouse for globe tilt + camera
      let tiltX = mouse.x;
      let tiltY = mouse.y;
      if (gyro.active) {
        tiltX = gyro.x * 0.7 + mouse.x * 0.3;
        tiltY = -gyro.y * 0.5 + mouse.y * 0.3;
      }

      const mouseWorld = screenToWorld(mouse.x, mouse.y);

      // ── Decay tap impulses ──
      for (let i = tapImpulses.length - 1; i >= 0; i--) {
        tapImpulses[i].time -= 0.016;
        if (tapImpulses[i].time <= 0) tapImpulses.splice(i, 1);
      }

      // --- GLOBE ---
      const globeOpacity = Math.max(0, 1 - scrollProgress * 2.5);
      const globeScale = 1 - scrollProgress * 0.2;

      globePivot.visible = globeOpacity > 0.01;
      globePivot.scale.setScalar(globeScale);

      // Auto-rotation Y on spin group
      globeAutoRotY += 0.003;
      globeSpin.rotation.y = globeAutoRotY;

      // Globe tilt — uses tilt (gyro-blended on mobile, pure mouse on desktop)
      globePivot.rotation.x += (tiltY * 0.6 - 0.3 - globePivot.rotation.x) * 0.04;
      globePivot.rotation.z += (-tiltX * 0.35 - globePivot.rotation.z) * 0.04;

      // Update globe material opacities
      globeDotMat.uniforms.uOpacity.value = globeOpacity;
      shieldMat.uniforms.uOpacity.value = globeOpacity;
      sunlightMat.uniforms.uOpacity.value = globeOpacity;
      ringMaterials.forEach(function (mat, i) {
        mat.opacity = (rings[i].userData as any).baseOpacity * globeOpacity;
      });

      // Slow independent ring rotation
      rings.forEach(function (ring, i) {
        ring.rotation.y += 0.001 * (i + 1);
      });

      // Stars
      starMat.uniforms.uTime.value = time;
      starMat.uniforms.uOpacity.value = globeOpacity;
      stars.visible = globeOpacity > 0.01;

      // --- WIREFRAME SHAPES (both layers) ---
      const shapeFade = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.4));
      const shapesActive = shapeFade > 0.01;

      // Helper: animate a single shape
      function animateShape(shape: THREE.Mesh) {
        shape.visible = shapesActive;
        if (!shapesActive) return;

        const d = shape.userData as any;
        const oScale = d.opacityScale ?? 1.0;
        (shape.material as THREE.MeshBasicMaterial).opacity = d.baseOpacity * oScale * shapeFade;

        const p = d.physics;
        if (!p) return;
        const origin = d.originalPos;
        const targetY = origin.y + Math.sin(time * d.floatSpeed) * d.floatAmp;

        // Spring
        const springX = -p.displacement.x * p.stiffness;
        const springY = -p.displacement.y * p.stiffness;
        const springZ = -p.displacement.z * p.stiffness;

        // Mouse repulsion
        const shapeWorldX = origin.x + p.displacement.x;
        const shapeWorldY = targetY + p.displacement.y;
        const dx = shapeWorldX - mouseWorld.x;
        const dy = shapeWorldY - mouseWorld.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let repelX = 0,
          repelY = 0,
          repelZ = 0;
        if (dist < INFLUENCE_RADIUS && dist > 0.1) {
          const force = (REPEL_STRENGTH / (dist * dist)) / p.mass;
          repelX = (dx / dist) * force;
          repelY = (dy / dist) * force;
          repelZ = dist < INFLUENCE_RADIUS * 0.5 ? force * 0.3 : 0;
        }

        // ── Tap impulses (mobile): radial push from tap point ──
        for (let ti = 0; ti < tapImpulses.length; ti++) {
          const imp = tapImpulses[ti];
          const idX = shapeWorldX - imp.x;
          const idY = shapeWorldY - imp.y;
          const iDist = Math.sqrt(idX * idX + idY * idY);
          if (iDist < TAP_IMPULSE_RADIUS && iDist > 0.1) {
            const fade = imp.time / TAP_IMPULSE_DURATION; // 1→0
            const iForce = (imp.strength * fade / (1 + iDist * 0.5)) / p.mass;
            repelX += (idX / iDist) * iForce;
            repelY += (idY / iDist) * iForce;
            repelZ += iForce * 0.15;
          }
        }

        p.velocity.x = (p.velocity.x + springX + repelX) * p.damping;
        p.velocity.y = (p.velocity.y + springY + repelY) * p.damping;
        p.velocity.z = (p.velocity.z + springZ + repelZ) * p.damping;

        p.displacement.x += p.velocity.x;
        p.displacement.y += p.velocity.y;
        p.displacement.z += p.velocity.z;

        const maxDisp = 12;
        p.displacement.x = Math.max(-maxDisp, Math.min(maxDisp, p.displacement.x));
        p.displacement.y = Math.max(-maxDisp, Math.min(maxDisp, p.displacement.y));
        p.displacement.z = Math.max(-maxDisp * 0.5, Math.min(maxDisp * 0.5, p.displacement.z));

        shape.position.x = origin.x + p.displacement.x;
        shape.position.y = targetY + p.displacement.y;
        shape.position.z = origin.z + p.displacement.z;

        const velMag = Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
        shape.rotation.x += d.rotSpeed.x + velMag * 0.02;
        shape.rotation.y += d.rotSpeed.y + velMag * 0.01;
        shape.rotation.z += d.rotSpeed.z;
      }

      // Layer 1: Active base shapes (scales with viewport)
      for (let si = 0; si < activeBaseCount; si++) {
        animateShape(baseShapes[si]);
      }

      // Layer 2: Active dynamic shapes only
      for (let si = 0; si < activeDynamicCount; si++) {
        animateShape(dynamicShapes[si]);
      }

      // Cursor follower
      cursorShape.visible = shapesActive;
      trail.forEach(function (t) {
        t.mesh.visible = shapesActive;
      });

      if (shapesActive) {
        cursorFollow.targetX = mouseWorld.x;
        cursorFollow.targetY = mouseWorld.y - 3;
        cursorFollow.x += (cursorFollow.targetX - cursorFollow.x) * 0.08;
        cursorFollow.y += (cursorFollow.targetY - cursorFollow.y) * 0.08;

        cursorShape.position.x = cursorFollow.x;
        cursorShape.position.y = cursorFollow.y;
        (cursorShape.material as THREE.MeshBasicMaterial).opacity = 0.35 * Math.min(1, shapeFade);
        cursorShape.rotation.x += 0.015;
        cursorShape.rotation.y += 0.02;
        cursorShape.rotation.z += 0.01;

        let prevX = cursorFollow.x;
        let prevY = cursorFollow.y;
        trail.forEach(function (t, idx) {
          const lag = 0.06 - idx * 0.008;
          t.pos.x += (prevX - t.pos.x) * lag;
          t.pos.y += (prevY - t.pos.y) * lag;
          t.mesh.position.x = t.pos.x;
          t.mesh.position.y = t.pos.y;
          (t.mesh.material as THREE.MeshBasicMaterial).opacity = (t.mesh.userData as any).baseOpacity * Math.min(1, shapeFade);
          t.mesh.rotation.x += 0.01 + idx * 0.005;
          t.mesh.rotation.y += 0.015 + idx * 0.003;
          prevX = t.pos.x;
          prevY = t.pos.y;
        });
      }

      // Camera parallax (gyro-blended on mobile, mouse on desktop)
      camera.position.x += (tiltX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (tiltY * 0.8 - camera.position.y) * 0.02;
      camera.rotation.z += (-tiltX * 0.005 - camera.rotation.z) * 0.02;
      camera.lookAt(0, -1, 0);

      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(resizeRAF);
      window.removeEventListener('resize', handleResize);
      // Remove mobile event listeners
      if (isMobile) {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchstart', onTapStart);
        window.removeEventListener('touchend', onTapEnd);
        window.removeEventListener('deviceorientation', onDeviceOrientation);
      }
      // Dispose all created geometries and materials
      createdGeos.forEach(g => g.dispose());
      amberMat.dispose();
      amberBrightMat.dispose();
      dimMat.dispose();
      particleDimMat.dispose();
      particleNormalMat.dispose();
      particleBrightMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Clean up window globals
      delete (window as any).threeShapeMaterials;
      delete (window as any).threeShapeGroups;
      delete (window as any).threeCursorShape;
      delete (window as any).threeTrail;
      delete (window as any).threeGlobeMaterials;
      delete (window as any).threeForceRender;
    };
  }, []);

  return <div id="threeBg" ref={containerRef} />;
}
