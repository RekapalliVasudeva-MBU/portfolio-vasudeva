const FRAME_COUNT = 240;
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const topProgressBar = document.getElementById('top-progress-bar');

const images = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;

// Pre-calculated canvas draw dimensions for zero per-frame math overhead
let cachedCanvasWidth = 0;
let cachedCanvasHeight = 0;
let cachedDrawWidth = 0;
let cachedDrawHeight = 0;
let cachedOffsetX = 0;
let cachedOffsetY = 0;
let isPortfolioVisible = false;

function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `./ezgif-6f07f9ea189b5dfe-jpg/ezgif-frame-${paddedIndex}.jpg`;
}

// Preload all 240 frames with GPU Pre-decoding for zero lag
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      
      const onDone = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.innerText = `${percent}%`;
        if (loadedCount === FRAME_COUNT) resolve();
      };

      img.onload = () => {
        if (img.decode) {
          img.decode().then(onDone).catch(onDone);
        } else {
          onDone();
        }
      };
      img.onerror = onDone;
      images.push(img);
    }
  });
}

// Calculate cover fit metrics on window resize only
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  cachedCanvasWidth = window.innerWidth;
  cachedCanvasHeight = window.innerHeight;
  
  canvas.width = cachedCanvasWidth * dpr;
  canvas.height = cachedCanvasHeight * dpr;
  ctx.scale(dpr, dpr);

  const sampleImg = images[0] || { naturalWidth: 1920, naturalHeight: 1080 };
  const imgWidth = sampleImg.naturalWidth || 1920;
  const imgHeight = sampleImg.naturalHeight || 1080;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = cachedCanvasWidth / cachedCanvasHeight;

  if (canvasRatio > imgRatio) {
    cachedDrawWidth = cachedCanvasWidth;
    cachedDrawHeight = cachedCanvasWidth / imgRatio;
  } else {
    cachedDrawHeight = cachedCanvasHeight;
    cachedDrawWidth = cachedCanvasHeight * imgRatio;
  }

  cachedOffsetX = (cachedCanvasWidth - cachedDrawWidth) / 2;
  cachedOffsetY = (cachedCanvasHeight - cachedDrawHeight) / 2;
}

// High-speed optimized frame draw
function drawFrame(frameIndex) {
  const index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frameIndex)));
  const img = images[index];

  if (!img || !img.complete) return;

  ctx.drawImage(img, cachedOffsetX, cachedOffsetY, cachedDrawWidth, cachedDrawHeight);
}

// Active Nav link tracking
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

// Update scroll target with zero latency
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

// Snappy lerp loop (0.42 lerp factor eliminates trailing lag)
function animationLoop() {
  const lerpFactor = 0.42; 
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.005) {
    currentFrame += diff * lerpFactor;
  } else {
    currentFrame = targetFrame;
  }

  drawFrame(currentFrame);
  requestAnimationFrame(animationLoop);
}

// 3D Canvas Micro Animations (Optimized with IntersectionObserver)
function init3DProjectCanvases() {
  const portfolioSection = document.getElementById('portfolio');
  if (portfolioSection) {
    const observer = new IntersectionObserver((entries) => {
      isPortfolioVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(portfolioSection);
  }

  // 1. RAG Project
  const ragCanvas = document.getElementById('canvas-rag');
  if (ragCanvas) {
    const rctx = ragCanvas.getContext('2d');
    let angle = 0;
    const nodes = Array.from({ length: 14 }, () => ({
      x: (Math.random() - 0.5) * 140,
      y: (Math.random() - 0.5) * 80,
      z: (Math.random() - 0.5) * 140,
    }));

    function renderRAG() {
      if (isPortfolioVisible) {
        angle += 0.015;
        rctx.clearRect(0, 0, ragCanvas.width, ragCanvas.height);
        const cx = ragCanvas.width / 2;
        const cy = ragCanvas.height / 2;

        const projected = nodes.map((node) => {
          const rad = angle;
          const rx = node.x * Math.cos(rad) - node.z * Math.sin(rad);
          const rz = node.x * Math.sin(rad) + node.z * Math.cos(rad);
          const scale = 200 / (200 + rz);
          return { x: cx + rx * scale, y: cy + node.y * scale, scale };
        });

        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const dx = projected[i].x - projected[j].x;
            const dy = projected[i].y - projected[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              rctx.beginPath();
              rctx.moveTo(projected[i].x, projected[i].y);
              rctx.lineTo(projected[j].x, projected[j].y);
              rctx.strokeStyle = `rgba(167, 139, 250, ${0.35 * (1 - dist / 80)})`;
              rctx.lineWidth = 1;
              rctx.stroke();
            }
          }
        }

        projected.forEach((p) => {
          rctx.beginPath();
          rctx.arc(p.x, p.y, 3.5 * p.scale, 0, Math.PI * 2);
          rctx.fillStyle = '#a78bfa';
          rctx.fill();
        });
      }
      requestAnimationFrame(renderRAG);
    }
    renderRAG();
  }

  // 2. Aether Desktop
  const aetherCanvas = document.getElementById('canvas-aether');
  if (aetherCanvas) {
    const actx = aetherCanvas.getContext('2d');
    let angleX = 0;
    let angleY = 0;

    const vertices = [
      [-35, -35, -35], [35, -35, -35], [35, 35, -35], [-35, 35, -35],
      [-35, -35, 35],  [35, -35, 35],  [35, 35, 35],  [-35, 35, 35],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    function renderAether() {
      if (isPortfolioVisible) {
        angleX += 0.012;
        angleY += 0.018;
        actx.clearRect(0, 0, aetherCanvas.width, aetherCanvas.height);
        const cx = aetherCanvas.width / 2;
        const cy = aetherCanvas.height / 2;

        const projected = vertices.map(([x, y, z]) => {
          let rad = angleX;
          let y1 = y * Math.cos(rad) - z * Math.sin(rad);
          let z1 = y * Math.sin(rad) + z * Math.cos(rad);
          rad = angleY;
          let x2 = x * Math.cos(rad) + z1 * Math.sin(rad);
          let z2 = -x * Math.sin(rad) + z1 * Math.cos(rad);

          const scale = 180 / (180 + z2);
          return { x: cx + x2 * scale, y: cy + y1 * scale };
        });

        edges.forEach(([u, v]) => {
          actx.beginPath();
          actx.moveTo(projected[u].x, projected[u].y);
          actx.lineTo(projected[v].x, projected[v].y);
          actx.strokeStyle = '#60a5fa';
          actx.lineWidth = 1.5;
          actx.stroke();
        });

        actx.beginPath();
        actx.arc(cx, cy, 8, 0, Math.PI * 2);
        actx.fillStyle = '#60a5fa';
        actx.fill();
      }
      requestAnimationFrame(renderAether);
    }
    renderAether();
  }

  // 3. Auto EUS CNN
  const eusCanvas = document.getElementById('canvas-eus');
  if (eusCanvas) {
    const ectx = eusCanvas.getContext('2d');
    let scanY = 0;

    function renderEUS() {
      if (isPortfolioVisible) {
        scanY = (scanY + 1.5) % eusCanvas.height;
        ectx.clearRect(0, 0, eusCanvas.width, eusCanvas.height);

        const cx = eusCanvas.width / 2;
        const cy = eusCanvas.height / 2;

        const cols = 8;
        const rows = 4;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = cx + (c - cols / 2 + 0.5) * 36;
            const y = cy + (r - rows / 2 + 0.5) * 30;
            const active = Math.abs(y - scanY) < 25;
            ectx.beginPath();
            ectx.arc(x, y, active ? 5 : 2.5, 0, Math.PI * 2);
            ectx.fillStyle = active ? '#f472b6' : 'rgba(244, 114, 182, 0.35)';
            ectx.fill();
          }
        }

        ectx.beginPath();
        ectx.moveTo(40, scanY);
        ectx.lineTo(eusCanvas.width - 40, scanY);
        ectx.strokeStyle = 'rgba(244, 114, 182, 0.8)';
        ectx.lineWidth = 1.5;
        ectx.stroke();
      }
      requestAnimationFrame(renderEUS);
    }
    renderEUS();
  }

  // 4. Text Summarization
  const sumCanvas = document.getElementById('canvas-sum');
  if (sumCanvas) {
    const sctx = sumCanvas.getContext('2d');
    let time = 0;
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 320 + 40,
      y: Math.random() * 160 + 20,
      speed: Math.random() * 1.5 + 0.8,
      size: Math.random() * 2.5 + 1.5,
    }));

    function renderSum() {
      if (isPortfolioVisible) {
        time += 0.03;
        sctx.clearRect(0, 0, sumCanvas.width, sumCanvas.height);
        const cx = sumCanvas.width / 2;
        const cy = sumCanvas.height / 2;

        sctx.beginPath();
        sctx.arc(cx, cy, 32 + Math.sin(time) * 4, 0, Math.PI * 2);
        sctx.strokeStyle = '#22d3ee';
        sctx.lineWidth = 1.5;
        sctx.stroke();

        particles.forEach((p) => {
          p.x -= p.speed;
          if (p.x < 40) p.x = sumCanvas.width - 40;
          sctx.beginPath();
          sctx.arc(p.x, p.y + Math.sin(time + p.x) * 5, p.size, 0, Math.PI * 2);
          sctx.fillStyle = '#22d3ee';
          sctx.fill();
        });
      }
      requestAnimationFrame(renderSum);
    }
    renderSum();
  }
}

// Optimized 3D Mouse Parallax Tilt
function init3DCardTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    let ticking = false;
    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

// Application Startup
async function init() {
  await preloadImages();
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });

  if (loader) {
    loader.classList.add('hidden');
  }

  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', updateScroll);
  }

  init3DProjectCanvases();
  init3DCardTilt();

  updateScroll();
  animationLoop();
}

init();
