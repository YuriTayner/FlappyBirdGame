let powerUpPickups = [];
let powerUpElapsed = 0;
let hasStoredPowerUp = false;

const powerUpInterval = 6;
const powerUpSpeed = 210;
const powerUpRadius = 15;

const powerUpSlot = document.querySelector("#power-up-slot");
const powerUpSlotLabel = document.querySelector("#power-up-slot-label");

function updatePowerUpSlot() {
  powerUpSlot.disabled = !hasStoredPowerUp;
  powerUpSlot.classList.toggle("power-up-slot--filled", hasStoredPowerUp);
  powerUpSlotLabel.textContent = hasStoredPowerUp
    ? "Power-up — clique para usar"
    : "Slot vazio";
  powerUpSlot.setAttribute(
    "aria-label",
    hasStoredPowerUp ? "Usar power-up armazenado" : "Slot vazio",
  );
}

function resetPowerUps() {
  powerUpPickups = [];
  powerUpElapsed = powerUpInterval - 2;
  hasStoredPowerUp = false;
  updatePowerUpSlot();
}

function drawPowerUps(context, width, height, deltaSeconds, isPlaying) {
  if (isPlaying) {
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

    collectPowerUps(width, height);
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
  updatePowerUpSlot();
}

powerUpSlot.addEventListener("click", useStoredPowerUp);
