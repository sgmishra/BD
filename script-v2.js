const CONTENT = window.BD_CONTENT || {};
const PASSCODE = CONTENT.config?.passcode || "1306";
const TRANSITION_MS = 760;

const screens = Array.from(document.querySelectorAll(".screen"));
const dots = Array.from(document.querySelectorAll('.screen[data-screen="unlock"] .passcode-dots span'));
const keys = Array.from(document.querySelectorAll(".key"));
const nextButtons = Array.from(document.querySelectorAll("[data-next]"));
const errorMessage = document.querySelector(".error-message");
const unlockPanel = document.querySelector(".unlock-panel");
const cakeStage = document.querySelector("#cakeStage");
const cakeButton = document.querySelector("#cakeButton");
const finaleFireworksNode = document.querySelector("#finaleFireworks");
const restartButton = document.querySelector("#restartButton");
const noButton = document.querySelector("#noButton");
const pleaseButton = document.querySelector("#pleaseButton");
const cryingOverlay = document.querySelector("#cryingOverlay");
const bgMusic = document.querySelector("#bgMusic");
const musicSource = bgMusic?.querySelector("source") ?? null;
const carouselNode = document.querySelector("#memoryCarousel");
const memoryRoll = document.querySelector(".js-memory-roll");
const memoryRollShell = document.querySelector(".js-memory-roll-shell");
const memoryReelTrack = document.querySelector(".js-memory-reel-track");
const vaultBeginButton = document.querySelector("#vaultBeginButton");
const vaultNextButton = document.querySelector("#vaultNextButton");
const vaultEntryButton = document.querySelector("#vaultEntryButton");
const vaultReveal = document.querySelector(".vault-reveal");
const vaultRevealImage = document.querySelector("#vaultRevealImage");
const vaultRevealPlaceholder = document.querySelector("#vaultRevealPlaceholder");
const vaultRevealTitle = document.querySelector("#vaultRevealTitle");
const vaultRevealCopy = document.querySelector("#vaultRevealCopy");
const vaultStatusBadge = document.querySelector("#vaultStatusBadge");
const vaultHistoryList = document.querySelector("#vaultHistoryList");
const vaultHistoryEmpty = document.querySelector("#vaultHistoryEmpty");
const vaultModal = document.querySelector("#vaultModal");
const vaultModalClose = document.querySelector("#vaultModalClose");
const vaultModalContinue = document.querySelector("#vaultModalContinue");
const vaultStartUnlock = document.querySelector("#vaultStartUnlock");
const vaultStages = Array.from(document.querySelectorAll("[data-vault-stage]"));
const vaultKeys = Array.from(document.querySelectorAll(".vault-key"));
const vaultDots = Array.from(document.querySelectorAll("#vaultDots span"));
const vaultErrorMessage = document.querySelector("#vaultErrorMessage");
const orbNodes = Array.from(document.querySelectorAll("[data-parallax]"));

const memoryCarousel = carouselNode ? bootstrap.Carousel.getOrCreateInstance(carouselNode) : null;

let activeScreen = "welcome";
let enteredCode = "";
let isTransitioning = false;
let currentTrack = bgMusic?.dataset.defaultSrc || musicSource?.getAttribute("src") || "";
let finaleFireworks = null;
let memoryHighlightFrame = null;
let vaultCode = "";
let currentGiftIndex = 0;

const vaultGifts = [
  {
    title: "Moonlit Memory",
    copy: "A soft little moment saved for later, warm enough to revisit any night.",
    history: "Unlocked first and tucked gently into the story.",
    image: "gifts/1.png",
  },
  {
    title: "Golden Glow",
    copy: "A brighter surprise with that same quiet sweetness you carry everywhere.",
    history: "Added with a warm glow and a tiny smile.",
    image: "gifts/2.png",
  },
  {
    title: "Sweet Check-In",
    copy: "The kind of gift that feels like a message arriving exactly when it should.",
    history: "Saved as one more soft piece of the night.",
    image: "gifts/3.png",
  },
  {
    title: "Little Spark",
    copy: "A tiny celebration wrapped up in color, warmth, and a bit of magic.",
    history: "Dropped into history like a spark that stayed.",
    image: "gifts/4.png",
  },
  {
    title: "Rosy Surprise",
    copy: "A prettier, softer reveal for the part of the story that lingers longest.",
    history: "Now resting in your unlocked list on the right.",
    image: "gifts/5.png",
  },
  {
    title: "Hidden Treasure",
    copy: "Another secret opened, another memory-shaped gift brought into the light.",
    history: "Unlocked quietly and added to your growing collection.",
    image: "gifts/6.png",
  },
  {
    title: "Last Little Wonder",
    copy: "The final surprise in the vault, still soft, still glowing, still yours.",
    history: "The last gift settled into place to complete the story.",
    image: "gifts/7.png",
  },
  {
    title: "Future Little Surprise",
    copy: "A placeholder for the next gift you will drop in later.",
    history: "Reserved and waiting for its real image.",
    image: "assets/gift-placeholder.svg",
  },
  {
    title: "Another Soft Secret",
    copy: "One more spot saved for a future surprise you want to add.",
    history: "Still wrapped and ready for customization.",
    image: "assets/gift-placeholder.svg",
  },
  {
    title: "Final Hidden Spot",
    copy: "The last placeholder slot, ready whenever you are.",
    history: "Kept open for one more special reveal.",
    image: "assets/gift-placeholder.svg",
  },
];

function applyContent() {
  const contentMap = CONTENT.text || {};
  const pageTitle = CONTENT.config?.title;

  if (pageTitle) {
    document.title = pageTitle;
  }

  Object.entries(contentMap).forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node && typeof value === "string") {
      node.textContent = value;
    }
  });

  const galleryButton = document.querySelector('.screen[data-screen="gallery"] [data-next="finale"]');
  if (galleryButton) {
    galleryButton.textContent = CONTENT.config?.galleryNext || "Next";
  }
}

function getScreen(name) {
  return document.querySelector(`[data-screen="${name}"]`);
}

function burstConfetti(x, y, count = 18) {
  if (typeof window.confetti === "function") {
    const originX = x / window.innerWidth;
    const originY = y / window.innerHeight;
    const particleCount = Math.max(18, Math.min(40, count));

    window.confetti({
      particleCount,
      spread: 72,
      startVelocity: 24,
      gravity: 1.02,
      decay: 0.95,
      scalar: 0.82,
      ticks: 180,
      disableForReducedMotion: true,
      origin: { x: originX, y: originY },
      colors: ["#ffd37a", "#ffe8b4", "#ffd9e5", "#fff6f4", "#ffc8a2"],
    });

    window.confetti({
      particleCount: Math.max(10, Math.round(particleCount * 0.45)),
      spread: 42,
      startVelocity: 18,
      gravity: 1.08,
      decay: 0.96,
      scalar: 0.64,
      ticks: 140,
      disableForReducedMotion: true,
      origin: { x: originX, y: Math.min(0.96, originY + 0.02) },
      colors: ["#ffe8b4", "#fff6f4", "#ffd9e5"],
    });

    return;
  }

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

function switchMusicTrack(nextTrack) {
  if (!bgMusic || !nextTrack || currentTrack === nextTrack) return;

  currentTrack = nextTrack;

  if (musicSource) {
    musicSource.setAttribute("src", nextTrack);
    bgMusic.load();
  } else {
    bgMusic.src = nextTrack;
  }

  bgMusic.volume = 0.6;
  bgMusic.play().catch(() => {});
}

function ensureFinaleFireworks() {
  const FireworksCtor = window.Fireworks?.default || window.Fireworks;

  if (finaleFireworks || !finaleFireworksNode || !FireworksCtor) {
    return finaleFireworks;
  }

  finaleFireworks = new FireworksCtor(finaleFireworksNode, {
    autoresize: true,
    opacity: 0.96,
    acceleration: 1.02,
    friction: 0.965,
    gravity: 1.22,
    particles: 132,
    traceLength: 5,
    traceSpeed: 14,
    explosion: 16,
    intensity: 42,
    flickering: 68,
    lineStyle: "round",
    hue: {
      min: 12,
      max: 52,
    },
    delay: {
      min: 18,
      max: 34,
    },
    rocketsPoint: {
      min: 8,
      max: 92,
    },
    brightness: {
      min: 60,
      max: 92,
    },
    decay: {
      min: 0.01,
      max: 0.02,
    },
    mouse: {
      click: false,
      move: false,
      max: 1,
    },
    sound: {
      enabled: false,
    },
  });

  return finaleFireworks;
}

function stopFinaleFireworks() {
  finaleFireworks?.stop();
}

function runCakeConfetti() {
  if (typeof window.confetti !== "function" || !cakeButton) return;

  const rect = cakeButton.getBoundingClientRect();
  const centerX = (rect.left + rect.width / 2) / window.innerWidth;
  const centerY = (rect.top + rect.height * 0.45) / window.innerHeight;
  const defaults = {
    ticks: 260,
    gravity: 0.92,
    decay: 0.94,
    startVelocity: 42,
    scalar: 1.02,
    disableForReducedMotion: true,
    colors: ["#ffd37a", "#ffe8b4", "#ffd9e5", "#fff6f4", "#ffc8a2"],
  };

  window.confetti({
    ...defaults,
    particleCount: 90,
    spread: 120,
    origin: { x: centerX, y: centerY },
  });

  window.confetti({
    ...defaults,
    particleCount: 56,
    angle: 62,
    spread: 72,
    origin: { x: Math.max(0.08, centerX - 0.16), y: Math.min(0.92, centerY + 0.04) },
  });

  window.confetti({
    ...defaults,
    particleCount: 56,
    angle: 118,
    spread: 72,
    origin: { x: Math.min(0.92, centerX + 0.16), y: Math.min(0.92, centerY + 0.04) },
  });
}

function launchCakeFinale() {
  const fireworks = ensureFinaleFireworks();

  fireworks?.start();
  fireworks?.launch(10);
  runCakeConfetti();
}

function setupMemoryReelLoop() {
  if (!memoryReelTrack || memoryReelTrack.dataset.loopReady === "true") return;

  memoryReelTrack.insertAdjacentHTML("beforeend", memoryReelTrack.innerHTML);
  memoryReelTrack.dataset.loopReady = "true";
}

function highlightMemoryRollCenter() {
  if (!memoryRoll) return;

  const slots = Array.from(memoryRoll.querySelectorAll(".memory-roll-slot"));
  const rollRect = memoryRoll.getBoundingClientRect();
  const centerX = rollRect.left + (rollRect.width / 2);
  const maxDistance = rollRect.width / 2;

  slots.forEach((slot) => {
    const card = slot.querySelector(".memory-roll-card");
    if (!card) return;

    const rect = slot.getBoundingClientRect();
    const slotCenter = rect.left + (rect.width / 2);
    const distance = Math.abs(slotCenter - centerX);
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const emphasis = 1 - normalizedDistance;
    const easedEmphasis = emphasis * emphasis * (3 - (2 * emphasis));
    const scale = 0.72 + (easedEmphasis * 1.28);
    const opacity = 0.14 + (easedEmphasis * 0.86);
    const shift = 18 - (easedEmphasis * 18);
    const zIndex = 1 + Math.round(easedEmphasis * 20);

    card.style.setProperty("--card-scale", scale.toFixed(3));
    card.style.setProperty("--card-opacity", opacity.toFixed(3));
    card.style.setProperty("--card-shift", `${shift.toFixed(1)}px`);
    card.style.setProperty("--card-z", `${zIndex}`);
  });
}

function startMemoryHighlightLoop() {
  if (!memoryRoll || memoryHighlightFrame !== null) return;

  const tick = () => {
    highlightMemoryRollCenter();
    memoryHighlightFrame = window.requestAnimationFrame(tick);
  };

  tick();
}

function stopMemoryHighlightLoop() {
  if (memoryHighlightFrame === null) return;
  window.cancelAnimationFrame(memoryHighlightFrame);
  memoryHighlightFrame = null;
}

function setupMemoryRollInteractions() {
  if (!memoryRoll || memoryRoll.dataset.interactionsReady === "true") return;

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const pause = () => memoryRoll.classList.add("is-paused");
    const play = () => memoryRoll.classList.remove("is-paused");

    memoryRoll.addEventListener("mouseenter", pause);
    memoryRoll.addEventListener("mouseleave", play);
  }

  memoryRoll.dataset.interactionsReady = "true";
}

function setVaultStage(stageName) {
  vaultStages.forEach((node) => {
    node.classList.toggle("is-active", node.dataset.vaultStage === stageName);
  });
}

function paintVaultDots() {
  vaultDots.forEach((dot, index) => {
    dot.classList.toggle("is-filled", index < vaultCode.length);
  });
}

function clearVaultCode(message = "") {
  vaultCode = "";
  if (vaultErrorMessage) {
    vaultErrorMessage.textContent = message;
  }
  paintVaultDots();
}

function openVaultModal(stageName = "intro") {
  if (!vaultModal || currentGiftIndex >= vaultGifts.length) return;

  vaultModal.classList.add("is-visible");
  vaultModal.setAttribute("aria-hidden", "false");
  clearVaultCode();
  setVaultStage(stageName);
}

function closeVaultModal() {
  if (!vaultModal) return;
  vaultModal.classList.remove("is-visible");
  vaultModal.setAttribute("aria-hidden", "true");
  setVaultStage("intro");
  clearVaultCode();
}

function setVaultRevealImage(src, alt, mode = "preview") {
  if (!vaultReveal || !vaultRevealImage || !src) return;

  vaultReveal.classList.add("is-swapping");

  const finishSwap = () => {
    vaultReveal.classList.remove("is-swapping");
    vaultReveal.classList.toggle("is-preview", mode === "preview");
    vaultReveal.classList.toggle("is-filled", mode === "filled");
  };

  vaultRevealImage.alt = alt || "Gift image";
  vaultRevealImage.onload = () => {
    finishSwap();
    vaultRevealImage.onload = null;
  };
  vaultRevealImage.src = src;

  if (vaultRevealImage.complete) {
    window.requestAnimationFrame(finishSwap);
    vaultRevealImage.onload = null;
  }
}

function syncVaultIdleState() {
  if (!vaultReveal || !vaultRevealTitle || !vaultRevealCopy || !vaultStatusBadge || !vaultBeginButton || !vaultNextButton) {
    return;
  }

  if (currentGiftIndex >= vaultGifts.length) {
    if (vaultRevealImage) {
      const lastGift = vaultGifts[vaultGifts.length - 1];
      setVaultRevealImage(lastGift.image, lastGift.title, "filled");
    }
    if (vaultRevealPlaceholder) {
      vaultRevealPlaceholder.hidden = true;
    }
    vaultStatusBadge.textContent = CONTENT.vault?.completeBadge || "Complete";
    vaultRevealTitle.textContent = CONTENT.vault?.completeTitle || "Every hidden gift is unlocked.";
    vaultRevealCopy.textContent = CONTENT.vault?.completeCopy || "The full little gift list is waiting on the right now.";
    vaultBeginButton.hidden = true;
    vaultNextButton.hidden = true;
    return;
  }

  if (vaultRevealImage) {
    const nextGift = vaultGifts[currentGiftIndex];
    setVaultRevealImage(nextGift.image, nextGift.title, "preview");
  }
  if (vaultRevealPlaceholder) {
    vaultRevealPlaceholder.hidden = false;
  }
  vaultStatusBadge.textContent = CONTENT.vault?.waitingBadge || "Waiting";
  vaultRevealTitle.textContent = CONTENT.vault?.waitingTitle || "A wrapped little surprise";
  vaultRevealCopy.textContent = CONTENT.vault?.waitingCopy || "Each unlocked gift appears here first, then slides into your history on the right so the whole story keeps building.";
  vaultBeginButton.hidden = false;
  vaultNextButton.hidden = true;
}

function appendVaultHistoryItem(gift) {
  if (!vaultHistoryList) return;

  vaultHistoryEmpty?.remove();

  const item = document.createElement("article");
  item.className = "vault-history-item";
  item.innerHTML = `
    <img src="${gift.image}" alt="${gift.title}">
    <div>
      <h4>${gift.title}</h4>
      <p>${gift.history}</p>
    </div>
  `;

  vaultHistoryList.prepend(item);
}

function revealVaultGift() {
  const gift = vaultGifts[currentGiftIndex];
  if (!gift || !vaultReveal || !vaultRevealImage || !vaultRevealTitle || !vaultRevealCopy || !vaultStatusBadge) {
    return;
  }

  vaultRevealPlaceholder?.setAttribute("hidden", "");
  setVaultRevealImage(gift.image, gift.title, "filled");
  vaultStatusBadge.textContent = CONTENT.vault?.unlockedBadge || "Gift unlocked";
  vaultRevealTitle.textContent = gift.title;
  vaultRevealCopy.textContent = gift.copy;
  appendVaultHistoryItem(gift);
  burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.38, 28);

  currentGiftIndex += 1;
  if (currentGiftIndex < vaultGifts.length) {
    vaultBeginButton.hidden = true;
    vaultNextButton.hidden = false;
  } else {
    vaultBeginButton.hidden = true;
    vaultNextButton.hidden = true;
  }
}

function handleVaultDigit(value) {
  if (vaultCode.length >= 4) return;

  vaultCode += value;
  if (vaultErrorMessage) {
    vaultErrorMessage.textContent = "";
  }
  paintVaultDots();

  if (vaultCode.length === 4) {
    if (vaultCode === PASSCODE) {
      revealVaultGift();
      setVaultStage("success");
      clearVaultCode();
      return;
    }

    window.setTimeout(() => clearVaultCode(CONTENT.config?.messages?.wrongPasscode || "Wrong passcode. Try the birthday date."), 220);
  }
}

function paintDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-filled", index < enteredCode.length);
  });
}

function clearCode(message = "") {
  enteredCode = "";
  errorMessage.textContent = message;
  unlockPanel?.classList.remove("is-error", "is-success");
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
  errorMessage.textContent = CONTENT.config?.messages?.unlocked || "Unlocked.";
  unlockPanel?.classList.remove("is-error");
  unlockPanel?.classList.add("is-success");
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

    unlockPanel?.classList.remove("is-success");
    unlockPanel?.classList.add("is-error");
    window.setTimeout(() => clearCode(CONTENT.config?.messages?.wrongPasscode || "Wrong passcode. Try the birthday date."), 240);
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

cakeButton?.addEventListener("click", () => {
  startMusic();
  switchMusicTrack(bgMusic?.dataset.finaleSrc || "");
  cakeStage.classList.remove("is-celebrating");
  void cakeStage.offsetWidth;
  cakeStage.classList.add("is-celebrating");
  vaultEntryButton?.removeAttribute("disabled");
  launchCakeFinale();
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

vaultBeginButton?.addEventListener("click", () => {
  startMusic();
  openVaultModal("intro");
});

vaultStartUnlock?.addEventListener("click", () => {
  setVaultStage("code");
  clearVaultCode();
});

vaultModalClose?.addEventListener("click", closeVaultModal);
vaultModalContinue?.addEventListener("click", closeVaultModal);
vaultModal?.addEventListener("click", (event) => {
  if (event.target === vaultModal) {
    closeVaultModal();
  }
});

vaultNextButton?.addEventListener("click", () => {
  syncVaultIdleState();
});

vaultKeys.forEach((key) => {
  key.addEventListener("click", () => {
    startMusic();
    const action = key.dataset.action;
    if (action === "clear") {
      clearVaultCode();
      return;
    }

    if (action === "delete") {
      vaultCode = vaultCode.slice(0, -1);
      vaultErrorMessage.textContent = "";
      paintVaultDots();
      return;
    }

    handleVaultDigit(key.textContent.trim());
  });
});

restartButton?.addEventListener("click", () => {
  screens.forEach((screen) => {
    screen.classList.remove("is-active", "is-leaving", "is-entering");
  });

  getScreen("welcome").classList.add("is-active");
  activeScreen = "welcome";
  isTransitioning = false;
  enteredCode = "";
  cakeStage.classList.remove("is-celebrating");
  vaultEntryButton?.setAttribute("disabled", "disabled");
  stopFinaleFireworks();
  clearCode();
  currentGiftIndex = 0;
  vaultHistoryList.querySelectorAll(".vault-history-item").forEach((item) => item.remove());
  if (vaultHistoryList && !vaultHistoryList.querySelector("#vaultHistoryEmpty")) {
    const emptyNode = document.createElement("div");
    emptyNode.className = "vault-history-empty";
    emptyNode.id = "vaultHistoryEmpty";
    emptyNode.textContent = CONTENT.vault?.emptyHistory || "Nothing has been unlocked yet.";
    vaultHistoryList.append(emptyNode);
  }
  closeVaultModal();
  syncVaultIdleState();
  memoryCarousel?.to(0);
  switchMusicTrack(bgMusic?.dataset.defaultSrc || "");
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
window.addEventListener("resize", highlightMemoryRollCenter, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopMemoryHighlightLoop();
    return;
  }

  startMemoryHighlightLoop();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && vaultModal?.classList.contains("is-visible")) {
    closeVaultModal();
  }
});

applyContent();
setupMemoryReelLoop();
setupMemoryRollInteractions();
highlightMemoryRollCenter();
startMemoryHighlightLoop();
paintDots();
paintVaultDots();
syncVaultIdleState();
