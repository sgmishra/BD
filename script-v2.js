const PASSCODE = "1306";
const TOTAL_STEPS = 6;
const TRANSITION_MS = 760;

const screens = Array.from(document.querySelectorAll(".screen"));
const dots = Array.from(document.querySelectorAll(".passcode-dots span"));
const keys = Array.from(document.querySelectorAll(".key"));
const nextButtons = Array.from(document.querySelectorAll("[data-next]"));
const errorMessage = document.querySelector(".error-message");
const giftButton = document.querySelector("#giftButtonV2");
const giftBox = document.querySelector("#giftBoxV2");
const cakeStage = document.querySelector("#cakeStageV2");
const cakeButton = document.querySelector("#cakeButtonV2");
const restartButton = document.querySelector("#restartButtonV2");
const noButton = document.querySelector("#noButtonV2");
const pleaseButton = document.querySelector("#pleaseButtonV2");
const cryingOverlay = document.querySelector("#cryingOverlay");
const bgMusic = document.querySelector("#bgMusic");
const orbNodes = Array.from(document.querySelectorAll("[data-parallax]"));

let activeScreen = "welcome";
let enteredCode = "";
let isTransitioning = false;

function getScreen(name) {
  return document.querySelector(`[data-screen="${name}"]`);
}

function burstConfetti(x, y, count = 18) {
  for (let index = 0; index < count; index += 1) {
    const bit = document.createElement("span");
    bit.className = "confetti-bit";
    bit.style.left = `${x}px`;
    bit.style.top = `${y}px`;
    bit.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
    bit.style.setProperty("--dy", `${-60 - Math.random() * 180}px`);
    bit.style.setProperty("--rot", `${Math.random() * 360}deg`);
    bit.style.setProperty("--hue", `${Math.floor(Math.random() * 60) + 330}`);
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 1200);
  }
}

function startMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0.6;
  bgMusic.play().catch(() => {});
}

function paintDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-filled", index < enteredCode.length);
  });
}

function clearCode(message = "") {
  enteredCode = "";
  errorMessage.textContent = message;
  paintDots();
}

function switchScreen(nextName) {
  if (isTransitioning || nextName === activeScreen) return;

  const current = getScreen(activeScreen);
  const next = getScreen(nextName);
  if (!current || !next) return;

  isTransitioning = true;
  current.classList.add("is-leaving");
  current.classList.remove("is-active");
  next.classList.add("is-active", "is-entering");

  window.setTimeout(() => {
    current.classList.remove("is-leaving");
    next.classList.remove("is-entering");
    activeScreen = nextName;
    isTransitioning = false;
  }, TRANSITION_MS);
}

function unlockStory() {
  errorMessage.textContent = "Unlocked.";
  burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.45, 24);
  window.setTimeout(() => switchScreen("message"), 260);
}

function handleDigit(value) {
  if (enteredCode.length >= 4 || activeScreen !== "unlock") return;

  enteredCode += value;
  errorMessage.textContent = "";
  paintDots();

  if (enteredCode.length === 4) {
    if (enteredCode === PASSCODE) {
      unlockStory();
      return;
    }

    window.setTimeout(() => clearCode("Wrong passcode. Try the birthday date."), 240);
  }
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    startMusic();
    switchScreen(button.dataset.next);
  });
});

keys.forEach((key) => {
  key.addEventListener("click", () => {
    startMusic();
    const action = key.dataset.action;
    if (action === "clear") {
      clearCode();
      return;
    }

    if (action === "delete") {
      enteredCode = enteredCode.slice(0, -1);
      errorMessage.textContent = "";
      paintDots();
      return;
    }

    handleDigit(key.textContent.trim());
  });
});

giftButton?.addEventListener("click", () => {
  startMusic();
  giftBox.classList.add("is-visible");
  burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.42, 20);
});

cakeButton?.addEventListener("click", () => {
  startMusic();
  if (!giftBox.classList.contains("is-visible")) {
    return;
  }

  cakeStage.classList.add("is-celebrating");
  burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.42, 28);
});

noButton?.addEventListener("click", () => {
  startMusic();
  cryingOverlay?.classList.add("is-visible");
  cryingOverlay?.setAttribute("aria-hidden", "false");
});

pleaseButton?.addEventListener("click", () => {
  startMusic();
  cryingOverlay?.classList.remove("is-visible");
  cryingOverlay?.setAttribute("aria-hidden", "true");
  switchScreen("invite");
});

restartButton?.addEventListener("click", () => {
  screens.forEach((screen) => {
    screen.classList.remove("is-active", "is-leaving", "is-entering");
  });

  getScreen("welcome").classList.add("is-active");
  activeScreen = "welcome";
  isTransitioning = false;
  enteredCode = "";
  giftBox.classList.remove("is-visible");
  cakeStage.classList.remove("is-celebrating");
  clearCode();
});

window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth) - 0.5;
  const y = (event.clientY / window.innerHeight) - 0.5;

  document.body.style.setProperty("--spot-x", `${event.clientX}px`);
  document.body.style.setProperty("--spot-y", `${event.clientY}px`);

  orbNodes.forEach((node) => {
    const depth = Number(node.dataset.parallax || "0");
    node.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
  });
});

window.addEventListener("pointerdown", startMusic, { once: true });
window.addEventListener("keydown", startMusic, { once: true });

paintDots();
