export function createLetterScene(ctx) {
  const scene = document.createElement("section");
  scene.className = "scene letter-scene";
  scene.setAttribute("aria-label", "Bức thư dành cho em");

  scene.innerHTML = `
    <div class="letter-aura" aria-hidden="true"></div>

    <div class="letter-shell">
      <article class="letter-paper">
        <div class="letter-stitch" aria-hidden="true"></div>

        <button
          class="letter-close"
          type="button"
          aria-label="Đóng bức thư"
        >
          ×
        </button>

        <div class="letter-scroll">
          <p class="letter-text typing-cursor"></p>
        </div>
      </article>

      <button
        class="letter-heart"
        type="button"
        aria-label="Mở trái tim trong thư"
        aria-hidden="true"
        disabled
      >
        ♥
      </button>

      <span class="letter-note">Chạm vào trái tim</span>
    </div>
  `;

  const scrollArea = scene.querySelector(".letter-scroll");
  const text = scene.querySelector(".letter-text");
  const heart = scene.querySelector(".letter-heart");
  const closeButton = scene.querySelector(".letter-close");

  const fullLetter = ctx.config.letter.join("\n");

  let character = 0;
  let typingTimer = 0;
  let openTimer = 0;
  let heartTimer = 0;
  let typingDone = false;

  function finishTyping() {
    if (typingDone) return;

    typingDone = true;
    clearTimeout(typingTimer);

    text.textContent = fullLetter;
    text.classList.remove("typing-cursor");

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: "smooth"
    });

    // Chỉ hiện trái tim sau khi toàn bộ chữ đã chạy xong
    heartTimer = setTimeout(() => {
      heart.disabled = false;
      heart.setAttribute("aria-hidden", "false");
      scene.classList.add("is-complete");
    }, 350);
  }

  function typeNext() {
    if (typingDone) return;

    character += 1;
    text.textContent = fullLetter.slice(0, character);

    if (character < fullLetter.length) {
      typingTimer = setTimeout(
        typeNext,
        Number(ctx.config.typingSpeed) || 28
      );

      if (character % 10 === 0) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    } else {
      finishTyping();
    }
  }

  function openHeart(event) {
    event.stopPropagation();

    if (!typingDone) return;

    ctx.navigate("final");
  }

  function closeLetter(event) {
    event.stopPropagation();
    ctx.navigate("universe");
  }

  heart.addEventListener("click", openHeart);
  closeButton.addEventListener("click", closeLetter);

  openTimer = setTimeout(() => {
    scene.classList.add("is-open");

    // Đợi giấy thư mở xong mới bắt đầu chạy chữ
    typingTimer = setTimeout(typeNext, 900);
  }, 80);

  return {
    element: scene,
    mode: "universe",

    destroy() {
      clearTimeout(openTimer);
      clearTimeout(typingTimer);
      clearTimeout(heartTimer);

      heart.removeEventListener("click", openHeart);
      closeButton.removeEventListener("click", closeLetter);
    }
  };
}