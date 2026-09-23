export function createMoonScene(ctx) {
  const scene = document.createElement("section");
  scene.className = "scene moon-scene";
  scene.setAttribute("aria-label", "Cảnh đêm Trung Thu");
  scene.innerHTML = `
    <div class="moon-stage">
      <img class="moon-stage__image" src="assets/main-scene.webp?v=8" alt="Trăng rằm, đèn trời và thỏ ngọc giữa bầu trời sao" draggable="false" />
      <button class="moon-target" type="button" aria-label="Ấn và giữ mặt trăng"></button>
      <div class="moon-hint">Ấn giữ vào mặt trăng 🌕</div>
    </div>
    <div class="moon-flash" aria-hidden="true"></div>
  `;

  const target = scene.querySelector(".moon-target");
  const holdTime = Number(ctx.config.holdTime) || 1500;
  target.style.setProperty("--hold-time", `${holdTime}ms`);
  let timer = 0;
  let activePointer = null;
  let completed = false;

  function begin(event) {
    if (completed || activePointer !== null) return;
    event.preventDefault();
    activePointer = event.pointerId;
    target.setPointerCapture?.(event.pointerId);
    target.classList.add("is-holding");
    ctx.playMusic();
    timer = window.setTimeout(complete, holdTime);
  }

  function cancel(event) {
    if (completed || (event && activePointer !== null && event.pointerId !== activePointer)) return;
    window.clearTimeout(timer);
    activePointer = null;
    target.classList.remove("is-holding");
  }

  function complete() {
    if (completed) return;
    completed = true;
    target.classList.add("is-holding");
    scene.classList.add("is-zooming");
    window.setTimeout(() => ctx.navigate("universe"), 1150);
  }

  function keyDown(event) {
    if ((event.key === " " || event.key === "Enter") && activePointer === null) {
      event.preventDefault();
      activePointer = "keyboard";
      target.classList.add("is-holding");
      ctx.playMusic();
      timer = window.setTimeout(complete, holdTime);
    }
  }

  function keyUp(event) {
    if ((event.key === " " || event.key === "Enter") && !completed) cancel();
  }

  target.addEventListener("pointerdown", begin);
  target.addEventListener("pointerup", cancel);
  target.addEventListener("pointercancel", cancel);
  target.addEventListener("lostpointercapture", cancel);
  target.addEventListener("keydown", keyDown);
  target.addEventListener("keyup", keyUp);

  return {
    element: scene,
    mode: "moon",
    destroy() {
      window.clearTimeout(timer);
      target.removeEventListener("pointerdown", begin);
      target.removeEventListener("pointerup", cancel);
      target.removeEventListener("pointercancel", cancel);
      target.removeEventListener("lostpointercapture", cancel);
      target.removeEventListener("keydown", keyDown);
      target.removeEventListener("keyup", keyUp);
    }
  };
}
