import { createStarfield } from "./shared/stars.js?v=8";
import { createMoonScene } from "./scenes/moon.js?v=8";
import { createUniverseScene } from "./scenes/universe.js?v=8";
import { createLetterScene } from "./scenes/letter.js?v=8";
import { createFinalScene } from "./scenes/final.js?v=8";

const config = window.GIFT_CONFIG;
const root = document.querySelector("#sceneRoot");
const music = document.querySelector("#backgroundMusic");
const stars = createStarfield(document.querySelector("#starCanvas"));
const factories = {
  moon: createMoonScene,
  universe: createUniverseScene,
  letter: createLetterScene,
  final: createFinalScene
};

music.volume = Number(config.musicVolume) || .42;
let current = null;
let musicPlaying = false;
let transitionLock = false;

async function playMusic() {
  try {
    await music.play();
    musicPlaying = true;
  } catch {
    musicPlaying = false;
  }
  return musicPlaying;
}

async function toggleMusic() {
  if (music.paused) return playMusic();
  music.pause();
  musicPlaying = false;
  return false;
}

function isMusicPlaying() {
  return musicPlaying && !music.paused;
}

function navigate(name) {
  if (!factories[name] || transitionLock) return;
  transitionLock = true;
  const previous = current;
  if (previous?.element) previous.element.classList.remove("is-active");

  window.setTimeout(() => {
    previous?.destroy?.();
    const context = { config, navigate, playMusic, toggleMusic, isMusicPlaying };
    current = factories[name](context);
    root.replaceChildren(current.element);
    stars.setMode(current.mode || "universe");
    requestAnimationFrame(() => {
      current.element.classList.add("is-active");
      transitionLock = false;
    });
  }, previous ? 260 : 0);
}

music.addEventListener("play", () => { musicPlaying = true; });
music.addEventListener("pause", () => { musicPlaying = false; });
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !music.paused) music.pause();
});

navigate("moon");
