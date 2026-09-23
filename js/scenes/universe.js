import { attachGestures } from "../shared/gestures.js?v=8";
import { clamp, iconButton, seededRandom, setStyles, svgIcon } from "../shared/utils.js?v=8";

const COLORS = ["#ffd8f1", "#ffffff", "#ff9bd3", "#d8ffff", "#ffc5eb", "#ffe7f7"];
const SYMBOLS = ["🏮", "🏮", "🏮", "🐇", "🐇", "🌕", "✨", "💍", "🌸"];

export function createUniverseScene(ctx) {
  const scene = document.createElement("section");
  scene.className = "scene universe-scene";
  scene.setAttribute("aria-label", "Không gian lời yêu 3D");

  const haze = document.createElement("div");
  haze.className = "space-haze";
  const viewport = document.createElement("div");
  viewport.className = "space-viewport";
  const world = document.createElement("div");
  world.className = "space-world";
  viewport.append(world);
  scene.append(haze, viewport);

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  const soundButton = iconButton(ctx.isMusicPlaying() ? "sound" : "mute", "Bật hoặc tắt nhạc");
  const heartButton = iconButton("heart", "Thả trái tim");
  const letterButton = iconButton("letter", "Mở bức thư");
  toolbar.append(soundButton, heartButton, letterButton);
  scene.append(toolbar);

  const guide = document.createElement("div");
  guide.className = "universe-guide";
  guide.textContent = "Kéo để xoay • Chụm hai ngón để phóng to • Nhấn ✉ để mở thư";
  scene.append(guide);

  const random = seededRandom(15102026);
  const fragment = document.createDocumentFragment();

  function positionItem(item, kind = "text") {
    const closeBias = random();
    const z = closeBias > .76 ? 40 + random() * 430 : -1080 + random() * 1120;
    const spreadX = kind === "photo" ? 76 : 94;
    const spreadY = kind === "photo" ? 70 : 86;
    setStyles(item, {
      "--x": `${(random() * 2 - 1) * spreadX}vw`,
      "--y": `${(random() * 2 - 1) * spreadY}vh`,
      "--z": `${z.toFixed(0)}px`,
      "--r": `${(random() * 24 - 12).toFixed(1)}deg`,
      "--float-x": `${(random() * 54 - 27).toFixed(0)}px`,
      "--float-y": `${(random() * 64 - 32).toFixed(0)}px`,
      "--dur": `${(4.2 + random() * 5.8).toFixed(2)}s`,
      "--delay": `${(-random() * 7).toFixed(2)}s`
    });
  }

  function outer(kind) {
    const item = document.createElement("div");
    item.className = `space-item space-item--${kind}`;
    positionItem(item, kind);
    return item;
  }

  for (let index = 0; index < 94; index += 1) {
    const item = outer("text");
    const content = document.createElement("span");
    content.className = "space-content space-message";
    content.textContent = ctx.config.messages[index % ctx.config.messages.length];
    setStyles(content, {
      "--size": `${(12 + random() * 24).toFixed(1)}px`,
      "--color": COLORS[Math.floor(random() * COLORS.length)],
      "--opacity": `${(.64 + random() * .36).toFixed(2)}`
    });
    item.append(content);
    fragment.append(item);
  }

  for (let index = 0; index < 42; index += 1) {
    const item = outer("heart");
    const content = document.createElement("span");
    content.className = "space-content space-heart";
    content.textContent = "♥";
    content.style.setProperty("--size", `${24 + random() * 58}px`);
    item.append(content);
    fragment.append(item);
  }

  for (let index = 0; index < 28; index += 1) {
    const item = outer("symbol");
    const content = document.createElement("span");
    content.className = "space-content space-symbol";
    content.textContent = SYMBOLS[index % SYMBOLS.length];
    content.style.setProperty("--size", `${24 + random() * 42}px`);
    item.append(content);
    fragment.append(item);
  }

  for (let index = 0; index < 12; index += 1) {
    const item = outer("photo");
    const content = document.createElement("span");
    content.className = "space-content space-photo";
    content.style.setProperty("--photo-size", `${68 + random() * 68}px`);
    const image = document.createElement("img");
    image.src = ctx.config.photos[index % ctx.config.photos.length];
    image.alt = "Khoảnh khắc của chúng mình";
    image.loading = "eager";
    content.append(image);
    item.append(content);
    fragment.append(item);
  }
  world.append(fragment);

  let rotationX = -4;
  let rotationY = 0;
  let zoom = -85;
  let lastInput = 0;
  let animationFrame = 0;

  const detachGestures = attachGestures(scene, {
    onDrag(dx, dy) {
      rotationY += dx * .16;
      rotationX = clamp(rotationX - dy * .11, -32, 32);
      lastInput = performance.now();
    },
    onPinch(delta) {
      zoom = clamp(zoom + delta * 1.15, -520, 430);
      lastInput = performance.now();
    }
  });

  function animate(time) {
    const activeAuto = time - lastInput > 900 ? 1 : .22;
    const autoY = Math.sin(time * .00019) * 20 * activeAuto;
    const autoX = Math.sin(time * .00013 + 1.2) * 5 * activeAuto;
    const autoZoom = Math.sin(time * .00037) * 76;
    world.style.transform = `translate3d(0,0,${zoom + autoZoom}px) rotateX(${rotationX + autoX}deg) rotateY(${rotationY + autoY}deg)`;
    animationFrame = requestAnimationFrame(animate);
  }
  animationFrame = requestAnimationFrame(animate);

  function toggleSound(event) {
    event.stopPropagation();
    ctx.toggleMusic().then((playing) => {
      soundButton.innerHTML = svgIcon(playing ? "sound" : "mute");
    });
  }

  function burst(event) {
    event.stopPropagation();
    for (let index = 0; index < 18; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart-burst";
      heart.textContent = "♥";
      setStyles(heart, {
        "--bx": `${42 + random() * 16}%`,
        "--by": `${35 + random() * 28}%`,
        "--bs": `${16 + random() * 34}px`,
        "--dx": `${(random() * 2 - 1) * 190}px`,
        "--dy": `${-80 - random() * 240}px`,
        "--turn": `${(random() * 2 - 1) * 160}deg`
      });
      scene.append(heart);
      window.setTimeout(() => heart.remove(), 1500);
    }
  }

  function openLetter(event) {
    event.stopPropagation();
    ctx.navigate("letter");
  }

  soundButton.addEventListener("click", toggleSound);
  heartButton.addEventListener("click", burst);
  letterButton.addEventListener("click", openLetter);

  return {
    element: scene,
    mode: "universe",
    destroy() {
      cancelAnimationFrame(animationFrame);
      detachGestures();
      soundButton.removeEventListener("click", toggleSound);
      heartButton.removeEventListener("click", burst);
      letterButton.removeEventListener("click", openLetter);
    }
  };
}
