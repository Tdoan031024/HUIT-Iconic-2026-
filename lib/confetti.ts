/**
 * High-performance, zero-dependency canvas confetti for HUIT's ICONIC 2026
 */
export function fireConfetti(durationMs: number = 3000) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  resize();

  const colors = [
    '#0A2FFF', // HUIT Blue
    '#79BCC2', // Iconic Teal
    '#F59E0B', // Gold
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#EF4444', // Crimson
  ];

  const particleCount = 120;
  const particles: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    scale: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    const startX = window.innerWidth * (0.3 + Math.random() * 0.4);
    const startY = window.innerHeight * 0.55;
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12;

    particles.push({
      x: startX,
      y: startY,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (4 + Math.random() * 4), // Initial upward boost
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      scale: 0.8 + Math.random() * 0.4,
    });
  }

  const startTime = Date.now();

  function render() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / durationMs;

    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let aliveCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;

      if (progress > 0.6) {
        p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
      }

      if (p.opacity > 0 && p.y < window.innerHeight + 50) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (elapsed < durationMs && aliveCount > 0) {
      requestAnimationFrame(render);
    } else {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(render);
}
