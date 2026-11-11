
let powerUpPickups = [];
let powerUpElapsed = 0;

let hasStoredPowerUp = false;
let immunityRemaining = 0;
let extraLives = 0;
let doubleCoinsRemaining = 0;

const powerUpInterval = 6;
const powerUpSpeed = 210;
const powerUpRadius = 15;

const immunityDuration = 10;
const rescueImmunityDuration = 3;
const doubleCoinsDuration = 15;

const maxExtraLives = 2;

// Configurações da morte súbita
const suddenDeathPowerInterval = 60;

let suddenDeathPowersEnabled = false;
let suddenDeathLifeElapsed = 0;
let suddenDeathShieldElapsed = 0;

const powerUpSlot = document.querySelector(
  "#power-up-slot"
);

const powerUpSlotLabel = document.querySelector(
  "#power-up-slot-label"
);

// Indicadores
const powerIndicators = document.createElement("div");

powerIndicators.id = "power-indicators";

powerIndicators.style.cssText = `
  position: absolute;
  z-index: 2;
  top: 82px;
  left: 20px;
  display: none;
  flex-direction: column;
  gap: 8px;
  color: white;
  font: 700 15px system-ui, sans-serif;
`;

document.querySelector(".sky").appendChild(powerIndicators);

function updatePowerIndicators() {
  if (gameState !== "playing") {
    powerIndicators.style.display = "none";
    return;
  }

  powerIndicators.style.display = "flex";
  powerIndicators.replaceChildren();

  const labels = [];

  labels.push(`❤️ Vidas extras: ${extraLives}`);

  if (immunityRemaining > 0) {
    labels.push(
      `🛡️ Proteção: ${Math.ceil(immunityRemaining)}s`
    );
  }

  if (doubleCoinsRemaining > 0) {
    labels.push(
      `🪙 Moedas 2x: ${Math.ceil(doubleCoinsRemaining)}s`
    );
  }

  if (suddenDeathPowersEnabled) {
    labels.push("☠️ Poderes raros: 60s");
  }

  for (const label of labels) {
    const item = document.createElement("div");

    item.textContent = label;

    item.style.cssText = `
      padding: 8px 12px;
      background: rgba(18,72,94,0.78);
      border: 2px solid rgba(255,255,255,0.8);
      border-radius: 8px;
    `;

    powerIndicators.appendChild(item);
  }
}

function updatePowerUpSlot() {
  powerUpSlot.disabled = !hasStoredPowerUp;

  powerUpSlot.classList.toggle(
    "power-up-slot--filled",
    hasStoredPowerUp
  );

  powerUpSlotLabel.textContent = hasStoredPowerUp
    ? "🛡️ Ativar escudo"
    : "Slot vazio";

  powerUpSlot.setAttribute(
    "aria-label",
    hasStoredPowerUp
      ? "Ativar escudo por dez segundos"
      : "Slot vazio"
  );
}

function resetPowerUps() {
  powerUpPickups = [];
  powerUpElapsed = powerUpInterval - 2;

  hasStoredPowerUp = false;
  immunityRemaining = 0;
  extraLives = 0;
  doubleCoinsRemaining = 0;

  suddenDeathPowersEnabled = false;
  suddenDeathLifeElapsed = 0;
  suddenDeathShieldElapsed = 0;

  updatePowerUpSlot();
  updatePowerIndicators();
}

function createPowerUp(width, height, type, offset = 0) {
  powerUpPickups.push({
    x: width + powerUpRadius + offset,
    y: height * (0.2 + Math.random() * 0.6),
    type
  });
}

function activateSuddenDeathPowers() {
  if (suddenDeathPowersEnabled) return;

  suddenDeathPowersEnabled = true;

  suddenDeathLifeElapsed = 0;
  suddenDeathShieldElapsed = 0;

  // Limitar vidas extras a uma
  extraLives = Math.min(extraLives, 1);

  // Remover bolinhas antigas de vida e escudo
  // que ainda não foram coletadas
  powerUpPickups = powerUpPickups.filter(
    pickup => pickup.type === "double"
  );

  // Manter o escudo guardado e a proteção ativa
  updatePowerIndicators();
}

function drawPowerUps(
  context,
  width,
  height,
  deltaSeconds,
  isPlaying,
  canCollect = true
) {
  if (isPlaying) {
    immunityRemaining = Math.max(
      0,
      immunityRemaining - deltaSeconds
    );

    doubleCoinsRemaining = Math.max(
      0,
      doubleCoinsRemaining - deltaSeconds
    );

    // Ativar regras especiais aos 100 metros
    if (isSuddenDeathActive()) {
      activateSuddenDeathPowers();
    }

    powerUpElapsed += deltaSeconds;

    if (!suddenDeathPowersEnabled) {
      // Poderes normais antes dos 100 metros
      while (powerUpElapsed >= powerUpInterval) {
        const types = ["life", "shield", "double"];

        const type = types[
          Math.floor(Math.random() * types.length)
        ];

        createPowerUp(width, height, type);

        powerUpElapsed -= powerUpInterval;
      }
    } else {
      // Na morte súbita, moedas 2x continuam normais
      while (powerUpElapsed >= powerUpInterval) {
        createPowerUp(width, height, "double");

        powerUpElapsed -= powerUpInterval;
      }

      // Uma bolinha de vida a cada 60 segundos
      suddenDeathLifeElapsed += deltaSeconds;

      while (
        suddenDeathLifeElapsed >= suddenDeathPowerInterval
      ) {
        createPowerUp(width, height, "life");

        suddenDeathLifeElapsed -= suddenDeathPowerInterval;
      }

      // Uma bolinha de escudo a cada 60 segundos
      suddenDeathShieldElapsed += deltaSeconds;

      while (
        suddenDeathShieldElapsed >= suddenDeathPowerInterval
      ) {
        createPowerUp(width, height, "shield", 85);

        suddenDeathShieldElapsed -= suddenDeathPowerInterval;
      }
    }

    const difficulty = getDifficultySettings();

    // Os poderes acompanham a velocidade do jogo
    const currentPowerSpeed = difficulty.speed;

    for (const pickup of powerUpPickups) {
      pickup.x -= currentPowerSpeed * deltaSeconds;
    }

    if (canCollect) {
      collectPowerUps(width, height);
    }

    powerUpPickups = powerUpPickups.filter(
      pickup => pickup.x + powerUpRadius >= 0
    );
  }

  for (const pickup of powerUpPickups) {
    drawPowerUp(context, pickup);
  }

  updatePowerIndicators();
}

function collectPowerUps(width, height) {
  const bird = getBirdBounds(width, height);

  for (let i = powerUpPickups.length - 1; i >= 0; i--) {
    const pickup = powerUpPickups[i];

    const overlapsHorizontally =
      bird.right > pickup.x - powerUpRadius &&
      bird.left < pickup.x + powerUpRadius;

    const overlapsVertically =
      bird.bottom > pickup.y - powerUpRadius &&
      bird.top < pickup.y + powerUpRadius;

    if (!overlapsHorizontally || !overlapsVertically) {
      continue;
    }

    if (pickup.type === "life") {
      const limit = suddenDeathPowersEnabled
        ? 1
        : maxExtraLives;

      if (extraLives >= limit) {
        continue;
      }

      extraLives++;
    }

    if (pickup.type === "shield") {
      if (hasStoredPowerUp) {
        continue;
      }

      hasStoredPowerUp = true;
    }

    if (pickup.type === "double") {
      doubleCoinsRemaining = doubleCoinsDuration;
    }

    powerUpPickups.splice(i, 1);

    updatePowerUpSlot();
    updatePowerIndicators();
    playPowerUpSound();
  }
}

function drawPowerUp(context, pickup) {
  let color;
  let glow;
  let symbol;

  if (pickup.type === "life") {
    color = "#36c879";
    glow = "rgba(54,200,121,0.3)";
    symbol = "♥";
  } else if (pickup.type === "shield") {
    color = "#3c9ff4";
    glow = "rgba(60,159,244,0.3)";
    symbol = "◆";
  } else {
    color = "#f5b928";
    glow = "rgba(245,185,40,0.35)";
    symbol = "2x";
  }

  context.save();

  // Brilho
  context.beginPath();
  context.arc(
    pickup.x,
    pickup.y,
    powerUpRadius + 8,
    0,
    Math.PI * 2
  );

  context.fillStyle = glow;
  context.fill();

  // Bolinha
  context.beginPath();
  context.arc(
    pickup.x,
    pickup.y,
    powerUpRadius,
    0,
    Math.PI * 2
  );

  context.fillStyle = color;
  context.fill();

  context.lineWidth = 3;
  context.strokeStyle = "#ffffff";
  context.stroke();

  // Símbolo
  context.fillStyle = "#ffffff";
  context.font = "bold 15px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(
    symbol,
    pickup.x,
    pickup.y + 1
  );

  context.restore();
}

function useStoredPowerUp() {
  if (
    !hasStoredPowerUp ||
    gameState !== "playing"
  ) {
    return;
  }

  hasStoredPowerUp = false;
  immunityRemaining = immunityDuration;

  updatePowerUpSlot();
  updatePowerIndicators();

  playPowerUpActivationSound();
}

function consumeExtraLife() {
  if (extraLives <= 0) {
    return false;
  }

  extraLives--;

  immunityRemaining = Math.max(
    immunityRemaining,
    rescueImmunityDuration
  );

  updatePowerIndicators();
  playPowerUpActivationSound();

  return true;
}

function isDoubleCoinsActive() {
  return doubleCoinsRemaining > 0;
}

function isBirdImmune() {
  return immunityRemaining > 0;
}

function isBirdBlinkVisible() {
  if (immunityRemaining <= 0) {
    return true;
  }

  return Math.floor(immunityRemaining * 10) % 2 === 0;
}

powerUpSlot.addEventListener(
  "click",
  useStoredPowerUp
);
