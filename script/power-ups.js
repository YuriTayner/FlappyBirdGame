let powerUpPickups = [];
let powerUpElapsed = 0;
let hasStoredPowerUp = false;
let immunityRemaining = 0;

const powerUpInterval = 6;
const powerUpSpeed = 210;
const powerUpRadius = 15;
const immunityDuration = 5;

const powerUpSlot = document.querySelector("#power-up-slot");
const powerUpSlotLabel = document.querySelector("#power-up-slot-label");

function updatePowerUpSlot() {
  powerUpSlot.disabled = !hasStoredPowerUp;
  powerUpSlot.classList.toggle("power-up-slot--filled", hasStoredPowerUp);
  powerUpSlotLabel.textContent = hasStoredPowerUp
    ? "Ativar imunidade"
    : "Slot vazio";
  powerUpSlot.setAttribute(
    "aria-label",
    hasStoredPowerUp ? "Ativar imunidade por cinco segundos" : "Slot vazio",
  );
}

function resetPowerUps() {
  powerUpPickups = [];
  powerUpElapsed = powerUpInterval - 2;
  hasStoredPowerUp = false;
  immunityRemaining = 0;
  updatePowerUpSlot();
}

function drawPowerUps(context, width, height, deltaSeconds, isPlaying, canCollect = true) {
  if (isPlaying) {
    immunityRemaining = Math.max(0, immunityRemaining - deltaSeconds);
    powerUpElapsed += deltaSeconds;

    while (powerUpElapsed >= powerUpInterval) {
      powerUpPickups.push({
        x: width + powerUpRadius,
        y: height * (0.2 + Math.random() * 0.6),
      });
      powerUpElapsed -= powerUpInterval;
    }

    for (const pickup of powerUpPickups) {
      pickup.x -= powerUpSpeed * deltaSeconds;
    }

    if (canCollect) {
      collectPowerUps(width, height);
    }
    powerUpPickups = powerUpPickups.filter(
      (pickup) => pickup.x + powerUpRadius >= 0,
    );
  }

  for (const pickup of powerUpPickups) {
    drawPowerUp(context, pickup);
  }
}

function collectPowerUps(width, height) {
  if (hasStoredPowerUp) {
    return;
  }

  const bird = getBirdBounds(width, height);

  const pickupIndex = powerUpPickups.findIndex((pickup) => {
    const overlapsHorizontally =
      bird.right > pickup.x - powerUpRadius &&
      bird.left < pickup.x + powerUpRadius;
    const overlapsVertically =
      bird.bottom > pickup.y - powerUpRadius &&
      bird.top < pickup.y + powerUpRadius;

    return overlapsHorizontally && overlapsVertically;
  });

  if (pickupIndex !== -1) {
    powerUpPickups.splice(pickupIndex, 1);
    hasStoredPowerUp = true;
    updatePowerUpSlot();
    playPowerUpSound();
  }
}

function drawPowerUp(context, pickup) {
  context.beginPath();
  context.arc(pickup.x, pickup.y, powerUpRadius + 7, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 225, 106, 0.28)";
  context.fill();

  context.beginPath();
  context.arc(pickup.x, pickup.y, powerUpRadius, 0, Math.PI * 2);
  context.fillStyle = "#ffe16a";
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = "#fffdf2";
  context.stroke();
}

function useStoredPowerUp() {
  if (!hasStoredPowerUp) {
    return;
  }

  hasStoredPowerUp = false;
  immunityRemaining = immunityDuration;
  updatePowerUpSlot();
  playPowerUpActivationSound();
}

function isBirdImmune() {
  return immunityRemaining > 0;
}

function isBirdBlinkVisible() {
  return Math.floor((immunityDuration - immunityRemaining) * 10) % 2 === 0;
}

powerUpSlot.addEventListener("click", useStoredPowerUp);
