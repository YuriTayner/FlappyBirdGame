const canvas = document.querySelector(".sky__canvas");
const context = canvas.getContext("2d");
const cloudSettings = [
  { x: 0.2, y: 0.34, size: 0.055, speed: 42 },
  { x: 0.56, y: 0.57, size: 0.04, speed: 54 },
  { x: 0.91, y: 0.43, size: 0.05, speed: 48 },
];
let clouds = [];
let distanceMeters = 0;
let distanceElapsed = 0;
let gameState = "ready";

const startScreen = document.querySelector("#start-screen");
const deathScreen = document.querySelector("#death-screen");
const finalDistance = document.querySelector("#final-distance");
const restartButton = document.querySelector("#restart-button");

function resetClouds() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  clouds = cloudSettings.map((cloud) => ({
    x: width * cloud.x,
    y: cloud.y,
    size: Math.min(width, height) * cloud.size,
    speed: cloud.speed,
  }));
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  resetClouds();
}

function drawSky(deltaSeconds = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const frameDelta = gameState === "playing" ? deltaSeconds : 0;

  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#55b9ed");
  sky.addColorStop(0.58, "#a9e1f7");
  sky.addColorStop(1, "#eaf8fc");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  const sunX = width * 0.78;
  const sunY = height * 0.22;
  const sunRadius = Math.min(width, height) * 0.065;
  const glow = context.createRadialGradient(
    sunX,
    sunY,
    sunRadius * 0.2,
    sunX,
    sunY,
    sunRadius * 2.8,
  );
  glow.addColorStop(0, "rgba(255, 245, 196, 0.48)");
  glow.addColorStop(1, "rgba(255, 245, 196, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.beginPath();
  context.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  context.fillStyle = "#fff4c4";
  context.fill();

  for (const cloud of clouds) {
    cloud.x -= cloud.speed * frameDelta;

    if (cloud.x + cloud.size * 1.8 < 0) {
      const rightmostX = clouds.reduce(
        (rightmost, currentCloud) => Math.max(rightmost, currentCloud.x),
        0,
      );
      cloud.x = Math.max(width, rightmostX) + cloud.size * 3.6;
    }

    drawCloud(cloud.x, height * cloud.y, cloud.size);
  }

  drawDistanceCounter(width, frameDelta);
  drawObstacles(context, width, height, frameDelta, gameState === "playing");
  drawPowerUps(context, width, height, frameDelta, gameState === "playing");

  const reachedBottom = drawBird(
    context,
    width,
    height,
    frameDelta,
    gameState === "playing",
  );

  if (
    gameState === "playing" &&
    (reachedBottom || hasObstacleCollision(width, height))
  ) {
    finishGame();
  }
}

function drawCloud(x, y, size) {
  context.beginPath();
  context.ellipse(x, y, size * 1.8, size * 0.48, 0, 0, Math.PI * 2);
  context.arc(x - size * 0.78, y - size * 0.12, size * 0.48, 0, Math.PI * 2);
  context.arc(x - size * 0.16, y - size * 0.42, size * 0.64, 0, Math.PI * 2);
  context.arc(x + size * 0.56, y - size * 0.2, size * 0.5, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  context.fill();
}

function drawDistanceCounter(width, deltaSeconds) {
  distanceElapsed += deltaSeconds;

  while (distanceElapsed >= 1) {
    distanceMeters += 1;
    distanceElapsed -= 1;
  }

  const label = `${distanceMeters} m`;
  context.font = "700 24px system-ui, sans-serif";
  context.textAlign = "right";
  context.textBaseline = "top";
  context.lineWidth = 4;
  context.strokeStyle = "rgba(255, 255, 255, 0.85)";
  context.strokeText(label, width - 24, 20);
  context.fillStyle = "#12485e";
  context.fillText(label, width - 24, 20);
}

function startGame() {
  resetBird(window.innerWidth, window.innerHeight);
  resetObstacles();
  resetPowerUps();
  gameState = "playing";
  startScreen.hidden = true;
  deathScreen.hidden = true;
  powerUpSlot.hidden = false;
}

function restartGame() {
  distanceMeters = 0;
  distanceElapsed = 0;
  resetClouds();
  startGame();
}

function finishGame() {
  if (gameState !== "playing") {
    return;
  }

  gameState = "gameover";
  finalDistance.textContent = `${distanceMeters} m`;
  deathScreen.hidden = false;
  powerUpSlot.hidden = true;
  restartButton.focus({ preventScroll: true });
}

let previousFrameTime = 0;

function animate(timestamp) {
  const deltaSeconds = previousFrameTime === 0
    ? 0
    : Math.min((timestamp - previousFrameTime) / 1000, 0.05);
  previousFrameTime = timestamp;

  drawSky(deltaSeconds);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawSky();
});

document.querySelector("#start-button").addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

resizeCanvas();
requestAnimationFrame(animate);