/* ========================================
   SHOWCASE PAGE — GSAP Animations + Three.js
   Case study storytelling with scroll reveals
   ======================================== */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


// ===== UTILITIES =====
function splitText(el, by = 'char') {
  const text = el.textContent.trim();
  el.innerHTML = '';
  el.setAttribute('aria-label', text);

  if (by === 'char') {
    text.split(/(\s+)/).forEach(segment => {
      if (/^\s+$/.test(segment)) {
        const space = document.createElement('span');
        space.className = 'char';
        space.textContent = '\u00A0';
        space.setAttribute('aria-hidden', 'true');
        el.appendChild(space);
        return;
      }
      const wordWrap = document.createElement('span');
      wordWrap.style.whiteSpace = 'nowrap';
      wordWrap.style.display = 'inline';
      segment.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.setAttribute('aria-hidden', 'true');
        wordWrap.appendChild(span);
      });
      el.appendChild(wordWrap);
    });
  } else {
    text.split(/\s+/).forEach((word, i, arr) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      if (i < arr.length - 1) {
        const space = document.createElement('span');
        space.className = 'word';
        space.innerHTML = '&nbsp;';
        space.setAttribute('aria-hidden', 'true');
        el.appendChild(space);
      }
    });
  }

  return el.querySelectorAll(by === 'char' ? '.char' : '.word');
}


// ===== NAV SCROLL EFFECT =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});


// ===== HERO ANIMATIONS =====
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Label
  tl.to('.sc-hero-label', { opacity: 1, y: 0, duration: 0.7, delay: 0.3 });

  // Title char animation
  const titleEl = document.querySelector('.sc-hero-title');
  if (titleEl) {
    const chars = splitText(titleEl, 'char');
    tl.to(chars, {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.6, stagger: 0.025, ease: 'power4.out',
    }, '-=0.3');
  }

  // Sub text
  tl.to('.sc-hero-sub', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');

  // Actions
  tl.to('.sc-hero-actions', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

  // Meta stats
  tl.to('.sc-hero-meta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');

  // Mockup image
  tl.to('.sc-hero-mockup', {
    opacity: 1, y: 0, scale: 1,
    duration: 1, ease: 'power2.out',
  }, '-=0.5');

  // Parallax on mockup
  gsap.to('.sc-hero-mockup', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.sc-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}


// ===== OVERVIEW ANIMATIONS =====
function initOverview() {
  // Section label
  const label = document.querySelector('.sc-overview .sc-section-label .reveal-heading');
  if (label) {
    const chars = splitText(label, 'char');
    gsap.to(chars, {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.5, stagger: 0.02, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sc-overview',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Problem card — slide from left
  gsap.to('.sc-overview-card--problem', {
    opacity: 1, x: 0,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: {
      trigger: '.sc-overview-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Solution card — slide from right
  gsap.to('.sc-overview-card--solution', {
    opacity: 1, x: 0,
    duration: 0.9, ease: 'power3.out',
    delay: 0.15,
    scrollTrigger: {
      trigger: '.sc-overview-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // List items stagger
  document.querySelectorAll('.sc-overview-card').forEach(card => {
    const items = card.querySelectorAll('.sc-overview-list li');
    if (items.length) {
      gsap.to(items, {
        opacity: 1, y: 0,
        duration: 0.4, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  });
}


// ===== FEATURES ANIMATIONS =====
function initFeatures() {
  // Section label
  const label = document.querySelector('.sc-features .sc-section-label .reveal-heading');
  if (label) {
    const chars = splitText(label, 'char');
    gsap.to(chars, {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.5, stagger: 0.02, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sc-features',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Feature cards — scale reveal with stagger
  document.querySelectorAll('.sc-feature-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, scale: 1,
      duration: 0.8, ease: 'power3.out',
      delay: i * 0.15,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}


// ===== TECH STACK ANIMATIONS =====
function initTech() {
  // Section label
  const label = document.querySelector('.sc-tech .sc-section-label .reveal-heading');
  if (label) {
    const chars = splitText(label, 'char');
    gsap.to(chars, {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.5, stagger: 0.02, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sc-tech',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Diagram
  gsap.to('.sc-tech-diagram', {
    opacity: 1, y: 0,
    duration: 0.8, ease: 'power2.out',
    scrollTrigger: {
      trigger: '.sc-tech-diagram',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Tech groups — staggered grid
  const groups = document.querySelectorAll('.sc-tech-group');
  gsap.to(groups, {
    opacity: 1, scale: 1, y: 0,
    duration: 0.6, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: {
      trigger: '.sc-tech-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
}


// ===== GALLERY — POLYGON HONEYCOMB + LIGHTBOX =====
function initGallery() {
  var items = document.querySelectorAll('.sc-gallery-item');
  var isMobile = window.innerWidth < 768;

  // Assign honeycomb grid positions (desktop only — tablet/mobile use CSS auto-flow)
  // Each batch of 3 = one row; alternating rows offset by 1 column; NO row overlap
  if (!isMobile) {
    items.forEach(function (item, i) {
      var batch = Math.floor(i / 3);        // which row (0, 1, 2, ...)
      var col = i % 3;                       // position within the row (0, 1, 2)
      var isOffset = batch % 2 === 1;        // even batches = normal, odd = offset

      var colStart = isOffset ? (col * 2 + 2) : (col * 2 + 1);
      var colEnd = colStart + 2;

      item.style.gridColumn = colStart + ' / ' + colEnd;
      item.style.gridRow = String(batch + 1);
    });
  }

  // Section label animation
  var label = document.querySelector('.sc-gallery .sc-section-label .reveal-heading');
  if (label) {
    var chars = splitText(label, 'char');
    gsap.to(chars, {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.5, stagger: 0.02, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sc-gallery',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Staggered scroll-reveal for gallery items
  items.forEach(function (item, i) {
    gsap.to(item, {
      opacity: 1, scale: 1,
      duration: 0.7, ease: 'power2.out',
      delay: i * 0.1,
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  ScrollTrigger.refresh();

  // Initialize lightbox
  initGalleryLightbox(items);
}


// ===== LIGHTBOX SYSTEM =====
function initGalleryLightbox(items) {
  var lightbox = document.getElementById('scGalleryLightbox');
  if (!lightbox) return;

  var backdrop  = lightbox.querySelector('.sc-lightbox-backdrop');
  var lbImg     = lightbox.querySelector('.sc-lightbox-img');
  var caption   = lightbox.querySelector('.sc-lightbox-caption');
  var counter   = lightbox.querySelector('.sc-lightbox-counter');
  var infoBar   = lightbox.querySelector('.sc-lightbox-info');
  var closeBtn  = lightbox.querySelector('.sc-lightbox-close');
  var prevBtn   = lightbox.querySelector('.sc-lightbox-prev');
  var nextBtn   = lightbox.querySelector('.sc-lightbox-next');

  var currentIndex = 0;
  var isOpen = false;
  var isAnimating = false;
  var totalItems = items.length;

  // Collect image data
  var imageData = Array.from(items).map(function (item) {
    var imgEl = item.querySelector('img');
    var captionEl = item.querySelector('.sc-gallery-caption-text');
    return {
      src: imgEl.src,
      alt: imgEl.alt,
      caption: captionEl ? captionEl.textContent : imgEl.alt,
    };
  });

  // Update lightbox content for a given index
  function updateContent(index) {
    lbImg.src = imageData[index].src;
    lbImg.alt = imageData[index].alt;
    caption.textContent = imageData[index].caption;
    counter.textContent = (index + 1) + ' / ' + totalItems;
  }

  // Open lightbox — smooth scale + fade from center
  function openLightbox(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = index;
    isOpen = true;

    updateContent(index);

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    // Reset any leftover inline styles
    gsap.set(lbImg, { clearProps: 'all' });

    var tl = gsap.timeline({
      onComplete: function () { isAnimating = false; },
    });

    // Backdrop + image scale-in simultaneously
    tl.fromTo(backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    tl.fromTo(lbImg,
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.35'
    );

    // Fade in controls
    tl.to([closeBtn, prevBtn, nextBtn], {
      opacity: 1, duration: 0.3, stagger: 0.05,
    }, '-=0.2');

    // Fade in info bar
    tl.to(infoBar, { opacity: 1, duration: 0.3 }, '-=0.2');
  }

  // Close lightbox
  function closeLightbox() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;

    var tl = gsap.timeline({
      onComplete: function () {
        lightbox.hidden = true;
        document.body.style.overflow = '';
        isOpen = false;
        isAnimating = false;
        gsap.set(lbImg, { clearProps: 'all' });
        gsap.set([closeBtn, prevBtn, nextBtn, infoBar, backdrop], { clearProps: 'opacity' });
      },
    });

    tl.to([closeBtn, prevBtn, nextBtn, infoBar], { opacity: 0, duration: 0.2 });
    tl.to(lbImg, {
      scale: 0.9, opacity: 0,
      duration: 0.3, ease: 'power2.in',
    }, '-=0.1');
    tl.to(backdrop, { opacity: 0, duration: 0.3 }, '-=0.2');
  }

  // Navigate between images
  function navigate(direction) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = (currentIndex + direction + totalItems) % totalItems;

    gsap.to(lbImg, {
      opacity: 0, x: direction * -30,
      duration: 0.2, ease: 'power2.in',
      onComplete: function () {
        updateContent(currentIndex);
        gsap.fromTo(lbImg,
          { opacity: 0, x: direction * 30 },
          {
            opacity: 1, x: 0,
            duration: 0.3, ease: 'power2.out',
            onComplete: function () { isAnimating = false; },
          }
        );
      },
    });
  }

  // Event listeners — click to open
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  // Close triggers
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  // Navigation
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) {
      navigate(delta > 0 ? -1 : 1);
    }
  }, { passive: true });
}


// ===== CTA ANIMATIONS =====
function initCTA() {
  // Heading word-by-word
  const heading = document.querySelector('.sc-cta-heading');
  if (heading) {
    const words = splitText(heading, 'word');
    gsap.from(words, {
      opacity: 0, y: 60, rotateX: -40,
      duration: 0.7, stagger: 0.08, ease: 'power4.out',
      scrollTrigger: {
        trigger: '.sc-cta',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Sub text
  gsap.to('.sc-cta-sub', {
    opacity: 1, y: 0,
    duration: 0.7, ease: 'power2.out',
    scrollTrigger: {
      trigger: '.sc-cta',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
  });

  // Actions
  gsap.to('.sc-cta-actions', {
    opacity: 1, y: 0,
    duration: 0.6, ease: 'back.out(2)',
    scrollTrigger: {
      trigger: '.sc-cta',
      start: 'top 55%',
      toggleActions: 'play none none reverse',
    },
  });
}


// ===== THREE.JS BACKGROUND (Lighter version) =====
function initThreeBackground() {
  const container = document.getElementById('threeBg');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const mat = new THREE.MeshBasicMaterial({
    color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.1,
  });
  const dimMat = new THREE.MeshBasicMaterial({
    color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.05,
  });

  const shapes = [];

  function addShape(geo, material, x, y, z, rotSpeed, floatSpeed, floatAmp) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.userData = {
      rotSpeed, floatSpeed, floatAmp, baseY: y,
      originalPos: { x, y, z },
      physics: {
        velocity: { x: 0, y: 0 },
        displacement: { x: 0, y: 0 },
        stiffness: 0.012 + Math.random() * 0.008,
        damping: 0.92 + Math.random() * 0.03,
      },
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  addShape(new THREE.IcosahedronGeometry(3, 1), mat, 14, 6, -6, { x: 0.002, y: 0.003, z: 0.001 }, 0.4, 1.5);
  addShape(new THREE.OctahedronGeometry(2, 0), dimMat, -12, -4, -10, { x: 0.003, y: 0.002, z: 0.004 }, 0.6, 1);
  addShape(new THREE.TorusGeometry(1.5, 0.4, 10, 20), dimMat, -8, 10, -8, { x: 0.004, y: 0.001, z: 0.003 }, 0.5, 1.2);
  addShape(new THREE.DodecahedronGeometry(1.8, 0), mat, 16, -8, -12, { x: 0.002, y: 0.004, z: 0.002 }, 0.35, 1.8);
  addShape(new THREE.TetrahedronGeometry(1.5, 0), dimMat, -4, -12, -7, { x: 0.003, y: 0.002, z: 0.005 }, 0.55, 1);

  // Cursor follower
  const cursorMat = new THREE.MeshBasicMaterial({
    color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.3,
  });
  const cursorShape = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), cursorMat);
  cursorShape.position.set(0, 0, 2);
  scene.add(cursorShape);

  const trail = [];
  for (let t = 0; t < 4; t++) {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4 - t * 0.06, 0),
      new THREE.MeshBasicMaterial({ color: 0xf5a623, wireframe: true, transparent: true, opacity: 0.12 - t * 0.025 })
    );
    m.position.set(0, 0, 1.5 - t * 0.3);
    scene.add(m);
    trail.push({ mesh: m, pos: { x: 0, y: 0 } });
  }

  // Expose materials for theme toggle
  window.threeShapeMaterials = [mat, dimMat, cursorMat];
  window.threeShapeGroups = {
    bright: [shapes[0]],
    normal: [shapes[3]],
    dim: [shapes[1], shapes[2], shapes[4]],
  };
  window.threeCursorShape = cursorShape;
  window.threeTrail = trail;

  const cursorFollow = { x: 0, y: 0 };

  function screenToWorld(mx, my) {
    const vec = new THREE.Vector3(mx, my, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(dist));
  }

  const mouse = { x: 0, y: 0, target: { x: 0, y: 0 } };

  window.addEventListener('mousemove', (e) => {
    mouse.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    mouse.x += (mouse.target.x - mouse.x) * 0.05;
    mouse.y += (mouse.target.y - mouse.y) * 0.05;

    const mouseWorld = screenToWorld(mouse.x, mouse.y);

    shapes.forEach(shape => {
      const d = shape.userData;
      const p = d.physics;
      const origin = d.originalPos;
      const targetY = origin.y + Math.sin(time * d.floatSpeed) * d.floatAmp;

      // Spring
      const sx = -p.displacement.x * p.stiffness;
      const sy = -p.displacement.y * p.stiffness;

      // Mouse repulsion
      const dx = (origin.x + p.displacement.x) - mouseWorld.x;
      const dy = (targetY + p.displacement.y) - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let rx = 0, ry = 0;
      if (dist < 8 && dist > 0.1) {
        const f = 0.5 / (dist * dist);
        rx = (dx / dist) * f;
        ry = (dy / dist) * f;
      }

      p.velocity.x = (p.velocity.x + sx + rx) * p.damping;
      p.velocity.y = (p.velocity.y + sy + ry) * p.damping;
      p.displacement.x = Math.max(-10, Math.min(10, p.displacement.x + p.velocity.x));
      p.displacement.y = Math.max(-10, Math.min(10, p.displacement.y + p.velocity.y));

      shape.position.x = origin.x + p.displacement.x;
      shape.position.y = targetY + p.displacement.y;

      shape.rotation.x += d.rotSpeed.x;
      shape.rotation.y += d.rotSpeed.y;
      shape.rotation.z += d.rotSpeed.z;
    });

    // Cursor tail
    cursorFollow.x += (mouseWorld.x - cursorFollow.x) * 0.08;
    cursorFollow.y += ((mouseWorld.y - 3) - cursorFollow.y) * 0.08;
    cursorShape.position.x = cursorFollow.x;
    cursorShape.position.y = cursorFollow.y;
    cursorShape.rotation.x += 0.015;
    cursorShape.rotation.y += 0.02;

    let px = cursorFollow.x, py = cursorFollow.y;
    trail.forEach((t, i) => {
      const lag = 0.06 - i * 0.01;
      t.pos.x += (px - t.pos.x) * lag;
      t.pos.y += (py - t.pos.y) * lag;
      t.mesh.position.x = t.pos.x;
      t.mesh.position.y = t.pos.y;
      t.mesh.rotation.x += 0.01 + i * 0.005;
      t.mesh.rotation.y += 0.015;
      px = t.pos.x;
      py = t.pos.y;
    });

    // Camera — smooth damped follow, no scroll influence
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 1.2 - camera.position.y) * 0.03;
    camera.rotation.z += (-mouse.x * 0.01 - camera.rotation.z) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}


// ===== 3D TRANSFORMERS-STYLE BUTTON FLIP =====
function initButtonFlip() {
  const configs = [
    { selector: '.sc-hero-actions .sc-btn--primary', backText: 'Live Preview', backIcon: 'visibility' },
    { selector: '.sc-hero-actions .sc-btn--ghost', backText: 'Source Code', backIcon: 'code' },
    { selector: '.sc-cta-actions .sc-btn--primary', backText: 'Get in Touch', backIcon: 'email' },
    { selector: '.sc-cta-actions .sc-btn--ghost', backText: 'Back to Portfolio', backIcon: 'arrow_back' },
  ];

  configs.forEach(({ selector, backText, backIcon }) => {
    const btn = document.querySelector(selector);
    if (btn) enhanceButton(btn, backText, backIcon);
  });

  function enhanceButton(btn, backText, backIcon) {
    if (btn.classList.contains('btn-3d')) return;
    const frontHTML = btn.innerHTML;

    btn.innerHTML =
      '<span class="btn-3d-inner">' +
      '<span class="btn-3d-front">' + frontHTML + '</span>' +
      '<span class="btn-3d-back">' +
      (backIcon ? '<span class="material-icons-round">' + backIcon + '</span> ' : '') +
      backText +
      '</span>' +
      '</span>' +
      '<span class="btn-geo-frag btn-geo-frag--diamond" aria-hidden="true"></span>' +
      '<span class="btn-geo-frag btn-geo-frag--tri" aria-hidden="true"></span>' +
      '<span class="btn-geo-frag btn-geo-frag--circle" aria-hidden="true"></span>' +
      '<span class="btn-geo-frag btn-geo-frag--line" aria-hidden="true"></span>';

    btn.classList.add('btn-3d');
  }
}


// ===== THEME TOGGLE WITH BUBBLE ANIMATION =====
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const bubble = document.getElementById('themeBubble');
  const root = document.documentElement;
  if (!toggle || !bubble) return;

  const darkThreeColors = { shape: 0xf5a623, bright: 0.2, normal: 0.12, dim: 0.06, cursor: 0.3, trail: 0.12 };
  const lightThreeColors = { shape: 0x8b6914, bright: 0.35, normal: 0.22, dim: 0.12, cursor: 0.45, trail: 0.2 };

  // Apply saved theme on load
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    root.setAttribute('data-theme', 'light');
    if (icon) icon.textContent = 'dark_mode';
    updateThreeMaterials('light');
  }

  let animating = false;

  function applyTheme(next, skipClassRemoval) {
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (icon) icon.textContent = next === 'light' ? 'dark_mode' : 'light_mode';
    updateThreeMaterials(next);
    if (!skipClassRemoval) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove('theme-switching');
        });
      });
    }
  }

  toggle.addEventListener('click', () => {
    if (animating) return;
    animating = true;

    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
    const bubbleDuration = Math.min(1, Math.max(0.5, diagonal * 0.35 / 1000));
    const newBgColor = next === 'dark' ? '#0a0a0a' : '#f5f3ef';

    // Canvas circle cover — bubble grows with new bg, theme applies near end
    const cvs = document.createElement('canvas');
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    cvs.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    gsap.fromTo(icon, { rotate: -90 }, { rotate: 0, duration: 0.6, ease: 'back.out(3)' });

    let themeApplied = false;
    const proxy = { r: 0 };
    gsap.to(proxy, {
      r: maxRadius,
      duration: bubbleDuration,
      ease: 'power2.inOut',
      onUpdate() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = newBgColor;
        ctx.beginPath();
        ctx.arc(x, y, proxy.r, 0, Math.PI * 2);
        ctx.fill();

        if (!themeApplied && proxy.r >= maxRadius * 0.95) {
          themeApplied = true;
          applyTheme(next, true);
        }
      },
      onComplete() {
        if (!themeApplied) applyTheme(next, true);
        document.body.removeChild(cvs);
        root.classList.remove('theme-switching');
        requestAnimationFrame(() => {
          animating = false;
          ScrollTrigger.refresh();
        });
      },
    });
  });

  function updateThreeMaterials(theme) {
    const colors = theme === 'light' ? lightThreeColors : darkThreeColors;
    if (window.threeShapeMaterials) {
      window.threeShapeMaterials.forEach(m => { m.color.setHex(colors.shape); });
    }
    if (window.threeShapeGroups) {
      window.threeShapeGroups.bright.forEach(m => { m.material.opacity = colors.bright; });
      window.threeShapeGroups.normal.forEach(m => { m.material.opacity = colors.normal; });
      window.threeShapeGroups.dim.forEach(m => { m.material.opacity = colors.dim; });
    }
    if (window.threeCursorShape) {
      window.threeCursorShape.material.opacity = colors.cursor;
      window.threeCursorShape.material.color.setHex(colors.shape);
    }
    if (window.threeTrail) {
      window.threeTrail.forEach((t, i) => {
        t.mesh.material.opacity = colors.trail - i * 0.025;
        t.mesh.material.color.setHex(colors.shape);
      });
    }
  }
}


// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 0 },
        duration: 1,
        ease: 'power2.inOut',
      });
    }
  });
});


// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  initHero();
  initOverview();
  initFeatures();
  initTech();
  initGallery();
  initCTA();
  initButtonFlip();
  initThreeBackground();
  initThemeToggle();
  ScrollTrigger.refresh();
});
