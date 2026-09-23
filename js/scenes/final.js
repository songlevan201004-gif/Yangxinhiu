import { attachGestures } from "../shared/gestures.js?v=8";
import { clamp, seededRandom } from "../shared/utils.js?v=8";

export function createFinalScene(ctx) {
  const scene = document.createElement("section");

  scene.className = "scene final-scene";
  scene.setAttribute("aria-label", "Khoảnh khắc cuối");

  scene.innerHTML = `
    <canvas
      class="final-canvas"
      aria-hidden="true"
    ></canvas>

    <div class="final-photo-shell">
      <div class="final-photo-frame">
        <img
          src="${ctx.config.finalPhoto}"
          alt="Khoảnh khắc của hai chúng mình"
          draggable="false"
        />
      </div>
    </div>
  `;

  const canvas = scene.querySelector(".final-canvas");
  const context = canvas.getContext("2d");
  const photoShell = scene.querySelector(".final-photo-shell");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;

  let particles = [];
  let orbitParticles = [];

  let heartCenterX = 0;
  let heartCenterY = 0;
  let heartWidth = 0;

  let rotX = 0;
  let rotY = 0;
  let zoom = 0;
  let lastInput = 0;

  function calculateHeartPosition() {
    const photoRect =
      photoShell.getBoundingClientRect();

    const photoTop =
      photoRect.height > 0
        ? photoRect.top
        : height * 0.43;

    const desiredWidth =
      width < 700
        ? Math.min(width * 0.88, 390)
        : Math.min(width * 0.58, 340);

    const topPadding = clamp(
      height * 0.028,
      22,
      38
    );

    /*
     * Chiều cao thật của công thức trái tim
     * xấp xỉ 90% chiều rộng.
     */
    const maxWidthFromHeight =
      (photoTop - topPadding) / 0.9;

    heartWidth = Math.max(
      150,
      Math.min(
        desiredWidth,
        maxWidthFromHeight
      )
    );

    heartCenterX = width / 2;

    /*
     * Đầu nhọn của tim hơi chạm vào ảnh,
     * giúp hai phần nối với nhau tự nhiên.
     */
    heartCenterY =
      photoTop -
      heartWidth * 0.53 +
      clamp(height * 0.008, 5, 9);
  }

  function heartPoint(t, layer = 1) {
    const unit = heartWidth / 32;

    const x =
      16 *
      Math.sin(t) ** 3 *
      unit *
      layer;

    const curveY =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return {
      x,
      y: -curveY * unit * layer
    };
  }

  function buildParticles() {
    calculateHeartPosition();

    /*
     * Tạo lại cùng một hình mỗi lần resize,
     * không làm tim thay đổi ngẫu nhiên.
     */
    const random = seededRandom(14022026);

    const outlineCount = 150;
    const totalParticles = 520;

    particles = Array.from(
      { length: totalParticles },
      (_, index) => {
        const outline =
          index < outlineCount;

        const t = outline
          ? (index / outlineCount) *
            Math.PI *
            2
          : random() * Math.PI * 2;

        const layer = outline
          ? 0.99 + random() * 0.018
          : 0.08 +
            Math.sqrt(random()) * 0.89;

        const point = heartPoint(t, layer);
        const horizontal =
          clamp(
            point.x / heartWidth + 0.5,
            0,
            1
          );

        let color;

        if (outline && random() < 0.38) {
          color = "255, 247, 250";
        } else if (random() < 0.08) {
          color = "255, 234, 244";
        } else if (horizontal < 0.38) {
          color = "255, 183, 91";
        } else if (horizontal > 0.64) {
          color = "255, 48, 157";
        } else {
          color = "255, 103, 180";
        }

        return {
          x: point.x,
          y: point.y,

          radius: outline
            ? 1.05 + random() * 1.15
            : 0.5 + random() * 1.25,

          opacity:
            0.55 + random() * 0.45,

          phase:
            random() * Math.PI * 2,

          twinkleSpeed:
            0.0018 + random() * 0.0027,

          drift: outline
            ? 0.2
            : 0.35 + random() * 1.1,

          color,
          outline,

          star:
            random() <
            (outline ? 0.09 : 0.025)
        };
      }
    );

    orbitParticles = Array.from(
      { length: 82 },
      () => ({
        angle: random() * Math.PI * 2,
        distance: 0.94 + random() * 0.12,
        radius: 0.45 + random() * 1.45,
        opacity: 0.25 + random() * 0.7,
        phase: random() * Math.PI * 2,
        speed:
          0.000025 +
          random() * 0.000035,
        pink: random() > 0.58
      })
    );
  }

  function resize() {
    width =
      scene.clientWidth || window.innerWidth;

    height =
      scene.clientHeight || window.innerHeight;

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width =
      Math.round(width * dpr);

    canvas.height =
      Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    buildParticles();
  }

  function heartbeat(time) {
    if (reducedMotion) return 1;

    const cycle =
      (time % 1500) / 1500;

    const firstBeat = Math.exp(
      -Math.pow(
        (cycle - 0.09) / 0.042,
        2
      )
    );

    const secondBeat =
      0.62 *
      Math.exp(
        -Math.pow(
          (cycle - 0.205) / 0.06,
          2
        )
      );

    return (
      1 +
      (firstBeat + secondBeat) * 0.038
    );
  }

  function traceHeartPath() {
    context.beginPath();

    const segments = 260;

    for (
      let index = 0;
      index <= segments;
      index += 1
    ) {
      const t =
        (index / segments) *
        Math.PI *
        2;

      const point = heartPoint(t);

      if (index === 0) {
        context.moveTo(
          point.x,
          point.y
        );
      } else {
        context.lineTo(
          point.x,
          point.y
        );
      }
    }

    context.closePath();
  }

  function drawOrbit(time) {
    const orbitX = heartWidth * 0.68;
    const orbitY = heartWidth * 0.215;

    context.save();

    context.translate(
      heartCenterX,
      heartCenterY + heartWidth * 0.06
    );

    context.rotate(-0.09);
    context.globalCompositeOperation =
      "lighter";

    context.beginPath();
    context.ellipse(
      0,
      0,
      orbitX,
      orbitY,
      0,
      0,
      Math.PI * 2
    );

    context.strokeStyle =
      "rgba(255, 165, 88, 0.14)";

    context.lineWidth = 1;
    context.shadowColor =
      "rgba(255, 111, 170, 0.42)";

    context.shadowBlur = 9;
    context.stroke();

    for (
      const particle of orbitParticles
    ) {
      const movement = reducedMotion
        ? 0
        : time * particle.speed;

      const angle =
        particle.angle + movement;

      const x =
        Math.cos(angle) *
        orbitX *
        particle.distance;

      const y =
        Math.sin(angle) *
        orbitY *
        particle.distance;

      const sparkle =
        0.5 +
        Math.sin(
          time * 0.002 +
            particle.phase
        ) **
          2 *
          0.5;

      const color = particle.pink
        ? `rgba(
            255,
            83,
            169,
            ${
              particle.opacity *
              sparkle
            }
          )`
        : `rgba(
            255,
            190,
            101,
            ${
              particle.opacity *
              sparkle
            }
          )`;

      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 8;

      context.beginPath();
      context.arc(
        x,
        y,
        particle.radius,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.restore();
  }

  function drawHeart(time) {
    const beat = heartbeat(time);

    /*
     * Vùng sáng mềm phía sau trái tim.
     */
    const halo =
      context.createRadialGradient(
        heartCenterX,
        heartCenterY,
        0,
        heartCenterX,
        heartCenterY,
        heartWidth * 0.68
      );

    halo.addColorStop(
      0,
      "rgba(255, 55, 156, 0.17)"
    );

    halo.addColorStop(
      0.52,
      "rgba(255, 81, 168, 0.07)"
    );

    halo.addColorStop(
      1,
      "rgba(255, 81, 168, 0)"
    );

    context.fillStyle = halo;

    context.fillRect(
      heartCenterX - heartWidth,
      heartCenterY - heartWidth,
      heartWidth * 2,
      heartWidth * 2
    );

    context.save();

    context.translate(
      heartCenterX,
      heartCenterY
    );

    context.scale(beat, beat);

    context.globalCompositeOperation =
      "lighter";

    /*
     * Lớp nền giúp tim luôn rõ hoàn chỉnh,
     * không còn tình trạng chỉ thấy hạt rời.
     */
    traceHeartPath();

    const heartGradient =
      context.createLinearGradient(
        -heartWidth / 2,
        0,
        heartWidth / 2,
        0
      );

    heartGradient.addColorStop(
      0,
      "rgba(255, 172, 88, 0.24)"
    );

    heartGradient.addColorStop(
      0.48,
      "rgba(255, 103, 180, 0.2)"
    );

    heartGradient.addColorStop(
      1,
      "rgba(255, 41, 151, 0.25)"
    );

    context.fillStyle = heartGradient;
    context.shadowColor =
      "rgba(255, 58, 158, 0.75)";

    context.shadowBlur = 30;
    context.fill();

    /*
     * Viền sáng mềm.
     */
    context.shadowColor =
      "rgba(255, 55, 158, 0.85)";

    context.shadowBlur = 25;
    context.lineWidth = 7;

    context.strokeStyle =
      "rgba(255, 80, 171, 0.18)";

    context.stroke();

    /*
     * Viền trắng mảnh, làm hình tim rõ nét.
     */
    context.shadowColor =
      "rgba(255, 178, 221, 0.9)";

    context.shadowBlur = 12;
    context.lineWidth = 1.4;

    context.strokeStyle =
      "rgba(255, 244, 249, 0.92)";

    context.stroke();

    /*
     * Hạt sáng được đặt đúng vị trí ngay từ
     * đầu, không bay từ ngoài vào.
     */
    for (const particle of particles) {
      const driftX =
        Math.sin(
          time * 0.0012 +
            particle.phase
        ) * particle.drift;

      const driftY =
        Math.cos(
          time * 0.001 +
            particle.phase
        ) *
        particle.drift *
        0.55;

      const sparkle =
        0.52 +
        Math.sin(
          time *
            particle.twinkleSpeed +
            particle.phase
        ) **
          2 *
          0.48;

      const opacity =
        particle.opacity * sparkle;

      const color =
        `rgba(${particle.color}, ${opacity})`;

      const drawX =
        particle.x + driftX;

      const drawY =
        particle.y + driftY;

      context.fillStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        particle.outline ? 10 : 6;

      context.beginPath();

      context.arc(
        drawX,
        drawY,
        particle.radius,
        0,
        Math.PI * 2
      );

      context.fill();

      if (
        particle.star &&
        sparkle > 0.86
      ) {
        const size =
          particle.radius * 3.2;

        context.strokeStyle = color;
        context.lineWidth = 0.65;

        context.beginPath();

        context.moveTo(
          drawX - size,
          drawY
        );

        context.lineTo(
          drawX + size,
          drawY
        );

        context.moveTo(
          drawX,
          drawY - size
        );

        context.lineTo(
          drawX,
          drawY + size
        );

        context.stroke();
      }
    }

    context.restore();
  }

  function animate(time) {
    context.clearRect(
      0,
      0,
      width,
      height
    );

    drawOrbit(time);
    drawHeart(time);

    const automatic =
      !reducedMotion &&
      time - lastInput > 1200
        ? 1
        : 0.12;

    const automaticRotY =
      Math.sin(time * 0.00052) *
      1.45 *
      automatic;

    const automaticRotX =
      Math.cos(time * 0.00045) *
      0.8 *
      automatic;

    const floating = reducedMotion
      ? 0
      : Math.sin(time * 0.001) * 1.8;

    photoShell.style.transform = `
      translate3d(
        -50%,
        ${floating}px,
        ${zoom}px
      )
      rotateX(
        ${rotX + automaticRotX}deg
      )
      rotateY(
        ${rotY + automaticRotY}deg
      )
    `;

    frame = requestAnimationFrame(
      animate
    );
  }

  const detachGestures = attachGestures(
    scene,
    {
      onDrag(dx, dy) {
        rotY = clamp(
          rotY + dx * 0.025,
          -5,
          5
        );

        rotX = clamp(
          rotX - dy * 0.022,
          -4,
          4
        );

        lastInput = performance.now();
      },

      onPinch(delta) {
        zoom = clamp(
          zoom + delta * 0.22,
          -25,
          36
        );

        lastInput = performance.now();
      }
    }
  );

  window.addEventListener(
    "resize",
    resize
  );

  window.visualViewport?.addEventListener(
    "resize",
    resize
  );

  frame = requestAnimationFrame(() => {
    resize();

    frame =
      requestAnimationFrame(animate);
  });

  return {
    element: scene,
    mode: "universe",

    destroy() {
      cancelAnimationFrame(frame);

      detachGestures();

      window.removeEventListener(
        "resize",
        resize
      );

      window.visualViewport?.removeEventListener(
        "resize",
        resize
      );
    }
  };
}
