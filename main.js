const FRAME_COUNT = 240;
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const topProgressBar = document.getElementById('top-progress-bar');

const images = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;

// Format frame path: ./ezgif-6f07f9ea189b5dfe-jpg/ezgif-frame-001.jpg ...
function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `./ezgif-6f07f9ea189b5dfe-jpg/ezgif-frame-${paddedIndex}.jpg`;
}

// Preload all 240 frames into RAM
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.innerText = `${percent}%`;

        if (loadedCount === FRAME_COUNT) resolve();
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) resolve();
      };
      images.push(img);
    }
  });
}

// Handle canvas retina scaling
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

// Cover fit drawing algorithm
function drawFrame(frameIndex) {
  const index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frameIndex)));
  const img = images[index];

  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
  }

  offsetX = (canvasWidth - drawWidth) / 2;
  offsetY = (canvasHeight - drawHeight) / 2;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Active Nav link tracking on scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  let currentSectionId = '';
  sections.forEach((sec) => {
    const top = sec.offsetTop - 120;
    const height = sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      currentSectionId = sec.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
}

// Map page scroll position to video frame
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const scrollFraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  targetFrame = scrollFraction * (FRAME_COUNT - 1);

  if (topProgressBar) {
    topProgressBar.style.width = `${scrollFraction * 100}%`;
  }

  updateActiveNavLink();
}

// Inertial lerp animation loop for main background canvas
function animationLoop() {
  const lerpFactor = 0.12;
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * lerpFactor;
  } else {
    currentFrame = targetFrame;
  }

  drawFrame(currentFrame);
  requestAnimationFrame(animationLoop);
}

/* ==========================================================================
   3D ANIMATED LOGO CANVASES & MICRO-ANIMATIONS
   ========================================================================== */

function init3DProjectCanvases() {
  // 1. RAG Project 3D Orbiting Vector Web
  const ragCanvas = document.getElementById('canvas-rag');
  if (ragCanvas) {
    const rctx = ragCanvas.getContext('2d');
    let angle = 0;
    const nodes = Array.from({ length: 18 }, () => ({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 100,
      z: (Math.random() - 0.5) * 160,
    }));

    function renderRAG() {
      angle += 0.015;
      rctx.clearRect(0, 0, ragCanvas.width, ragCanvas.height);
      const cx = ragCanvas.width / 2;
      const cy = ragCanvas.height / 2;

      const projected = nodes.map((node) => {
        const rad = angle;
        const rx = node.x * Math.cos(rad) - node.z * Math.sin(rad);
        const rz = node.x * Math.sin(rad) + node.z * Math.cos(rad);
        const scale = 220 / (220 + rz);
        return { x: cx + rx * scale, y: cy + node.y * scale, scale, z: rz };
      });

      // Draw Connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            rctx.beginPath();
            rctx.moveTo(projected[i].x, projected[i].y);
            rctx.lineTo(projected[j].x, projected[j].y);
            rctx.strokeStyle = `rgba(167, 139, 250, ${0.4 * (1 - dist / 90)})`;
            rctx.lineWidth = 1.2;
            rctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach((p) => {
        rctx.beginPath();
        rctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
        rctx.fillStyle = '#a78bfa';
        rctx.shadowColor = '#8b5cf6';
        rctx.shadowBlur = 10;
        rctx.fill();
        rctx.shadowBlur = 0;
      });

      requestAnimationFrame(renderRAG);
    }
    renderRAG();
  }

  // 2. Aether Desktop 3D Wireframe Cube
  const aetherCanvas = document.getElementById('canvas-aether');
  if (aetherCanvas) {
    const actx = aetherCanvas.getContext('2d');
    let angleX = 0;
    let angleY = 0;

    const vertices = [
      [-40, -40, -40], [40, -40, -40], [40, 40, -40], [-40, 40, -40],
      [-40, -40, 40],  [40, -40, 40],  [40, 40, 40],  [-40, 40, 40],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    function renderAether() {
      angleX += 0.012;
      angleY += 0.018;
      actx.clearRect(0, 0, aetherCanvas.width, aetherCanvas.height);
      const cx = aetherCanvas.width / 2;
      const cy = aetherCanvas.height / 2;

      const projected = vertices.map(([x, y, z]) => {
        // Rotate X
        let rad = angleX;
        let y1 = y * Math.cos(rad) - z * Math.sin(rad);
        let z1 = y * Math.sin(rad) + z * Math.cos(rad);
        // Rotate Y
        rad = angleY;
        let x2 = x * Math.cos(rad) + z1 * Math.sin(rad);
        let z2 = -x * Math.sin(rad) + z1 * Math.cos(rad);

        const scale = 200 / (200 + z2);
        return { x: cx + x2 * scale, y: cy + y1 * scale };
      });

      // Draw Edges
      edges.forEach(([u, v]) => {
        actx.beginPath();
        actx.moveTo(projected[u].x, projected[u].y);
        actx.lineTo(projected[v].x, projected[v].y);
        actx.strokeStyle = '#60a5fa';
        actx.lineWidth = 2;
        actx.shadowColor = '#3b82f6';
        actx.shadowBlur = 8;
        actx.stroke();
        actx.shadowBlur = 0;
      });

      // Glowing Center Core
      actx.beginPath();
      actx.arc(cx, cy, 10 + Math.sin(angleX * 2) * 3, 0, Math.PI * 2);
      actx.fillStyle = '#60a5fa';
      actx.shadowColor = '#60a5fa';
      actx.shadowBlur = 15;
      actx.fill();
      actx.shadowBlur = 0;

      requestAnimationFrame(renderAether);
    }
    renderAether();
  }

  // 3. Auto EUS CNN 3D Neural Scanner Matrix
  const eusCanvas = document.getElementById('canvas-eus');
  if (eusCanvas) {
    const ectx = eusCanvas.getContext('2d');
    let scanY = 0;
    let pulse = 0;

    function renderEUS() {
      scanY = (scanY + 1.5) % eusCanvas.height;
      pulse += 0.05;
      ectx.clearRect(0, 0, eusCanvas.width, eusCanvas.height);

      const cx = eusCanvas.width / 2;
      const cy = eusCanvas.height / 2;

      // Draw Neural Grid Matrix
      const cols = 8;
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = cx + (c - cols / 2 + 0.5) * 36;
          const y = cy + (r - rows / 2 + 0.5) * 30;

          const active = Math.abs(y - scanY) < 25;
          ectx.beginPath();
          ectx.arc(x, y, active ? 6 : 3, 0, Math.PI * 2);
          ectx.fillStyle = active ? '#f472b6' : 'rgba(236, 72, 153, 0.4)';
          if (active) {
            ectx.shadowColor = '#f472b6';
            ectx.shadowBlur = 12;
          }
          ectx.fill();
          ectx.shadowBlur = 0;
        }
      }

      // Laser Scanner Beam Line
      ectx.beginPath();
      ectx.moveTo(40, scanY);
      ectx.lineTo(eusCanvas.width - 40, scanY);
      ectx.strokeStyle = 'rgba(244, 114, 182, 0.8)';
      ectx.lineWidth = 2;
      ectx.shadowColor = '#ec4899';
      ectx.shadowBlur = 10;
      ectx.stroke();
      ectx.shadowBlur = 0;

      requestAnimationFrame(renderEUS);
    }
    renderEUS();
  }

  // 4. Text Summarization 3D Morphing Transformer Beam
  const sumCanvas = document.getElementById('canvas-sum');
  if (sumCanvas) {
    const sctx = sumCanvas.getContext('2d');
    let time = 0;
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * 320 + 40,
      y: Math.random() * 160 + 20,
      speed: Math.random() * 1.5 + 0.8,
      size: Math.random() * 3 + 2,
    }));

    function renderSum() {
      time += 0.03;
      sctx.clearRect(0, 0, sumCanvas.width, sumCanvas.height);
      const cx = sumCanvas.width / 2;
      const cy = sumCanvas.height / 2;

      // Transformer Focus Ring
      sctx.beginPath();
      sctx.arc(cx, cy, 35 + Math.sin(time) * 4, 0, Math.PI * 2);
      sctx.strokeStyle = '#22d3ee';
      sctx.lineWidth = 2;
      sctx.shadowColor = '#06b6d4';
      sctx.shadowBlur = 14;
      sctx.stroke();
      sctx.shadowBlur = 0;

      // Particles Converging into Ring
      particles.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 40) p.x = sumCanvas.width - 40;

        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        sctx.beginPath();
        sctx.arc(p.x, p.y + Math.sin(time + p.x) * 6, p.size, 0, Math.PI * 2);
        sctx.fillStyle = dist < 50 ? '#22d3ee' : 'rgba(34, 211, 238, 0.5)';
        sctx.fill();
      });

      requestAnimationFrame(renderSum);
    }
    renderSum();
  }
}

/* ==========================================================================
   3D CARD PARALLAX TILT EFFECT
   ========================================================================== */

function init3DCardTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

// Startup
async function init() {
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    drawFrame(currentFrame);
  });

  await preloadImages();

  if (loader) {
    loader.classList.add('hidden');
  }

  // Lenis smooth scroll initialization
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', updateScroll);
  } else {
    window.addEventListener('scroll', updateScroll, { passive: true });
  }

  init3DProjectCanvases();
  init3DCardTilt();

  updateScroll();
  animationLoop();
}

init();
