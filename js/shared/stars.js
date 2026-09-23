import { seededRandom } from "./utils.js?v=8";

export function createStarfield(canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  const random = seededRandom(20260915);
  let stars = [];
  let mode = "moon";
  let frame = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    const density = mode === "universe" ? 930 : 1650;
    const count = Math.max(mode === "universe" ? 420 : 150, Math.min(920, Math.round(width * height / density)));
    stars = Array.from({ length: count }, (_, index) => ({
      x: random() * width,
      y: random() * height,
      radius: index % 31 === 0 ? 1.9 + random() * 1.7 : .25 + random() * 1.15,
      alpha: .2 + random() * .8,
      phase: random() * Math.PI * 2,
      speed: .45 + random() * 1.8,
      warm: random() > .88,
      flare: index % 37 === 0
    }));
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = "lighter";

    for (const star of stars) {
      const pulse = .52 + Math.sin(time * .001 * star.speed + star.phase) * .38;
      const alpha = star.alpha * Math.max(.12, pulse);
      const color = star.warm ? `rgba(255,208,133,${alpha})` : `rgba(218,232,255,${alpha})`;
      context.beginPath();
      context.fillStyle = color;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();

      if (star.flare && alpha > .42) {
        const length = 5 + star.radius * 3;
        context.strokeStyle = color;
        context.lineWidth = .6;
        context.beginPath();
        context.moveTo(star.x - length, star.y);
        context.lineTo(star.x + length, star.y);
        context.moveTo(star.x, star.y - length);
        context.lineTo(star.x, star.y + length);
        context.stroke();
      }
    }

    context.restore();
    frame = requestAnimationFrame(draw);
  }

  function setMode(nextMode) {
    mode = nextMode;
    buildStars();
    canvas.style.opacity = nextMode === "moon" ? ".42" : "1";
  }

  window.addEventListener("resize", resize);
  resize();
  frame = requestAnimationFrame(draw);

  return {
    setMode,
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    }
  };
}
