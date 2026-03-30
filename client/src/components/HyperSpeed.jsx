import { useRef, useEffect } from 'react';

export default function HyperSpeed() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let stars = [];
    const STAR_COUNT = 600;
    const SPEED = 0.025;
    const TRAIL = 0.6;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width * 2,
          y: (Math.random() - 0.5) * canvas.height * 2,
          z: Math.random() * canvas.width,
          pz: 0,
        });
        stars[i].pz = stars[i].z;
      }
    }

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= s.z * SPEED;

        if (s.z < 1) {
          s.x = (Math.random() - 0.5) * canvas.width * 2;
          s.y = (Math.random() - 0.5) * canvas.height * 2;
          s.z = canvas.width;
          s.pz = s.z;
        }

        const sx = (s.x / s.z) * canvas.width * 0.5 + cx;
        const sy = (s.y / s.z) * canvas.height * 0.5 + cy;
        const px = (s.x / s.pz) * canvas.width * 0.5 + cx;
        const py = (s.y / s.pz) * canvas.height * 0.5 + cy;

        const brightness = 1 - s.z / canvas.width;
        const size = Math.max(0.5, brightness * 2.5);

        const goldR = 226, goldG = 201, goldB = 126;
        const whiteR = 245, whiteG = 240, whiteB = 232;
        const isGold = i % 3 === 0;
        const r = isGold ? goldR : whiteR;
        const g = isGold ? goldG : whiteG;
        const b = isGold ? goldB : whiteB;

        ctx.strokeStyle = `rgba(${r},${g},${b},${brightness * TRAIL})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    draw();
    window.addEventListener('resize', () => { resize(); initStars(); });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hyperspeed-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
