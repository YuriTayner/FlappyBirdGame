let birdY = null;
let birdVelocity = 0;

function jumpBird() {
  birdVelocity = -360;
}

function resetBird(width, height) {
  const size = Math.min(Math.min(width, height) * 0.075, 64);
  birdY = height * 0.5 - size / 2;
  birdVelocity = 0;
}

function getBirdBounds(width, height) {
  const size = Math.min(Math.min(width, height) * 0.075, 64);

  return {
    left: width * 0.44 - size / 2,
    right: width * 0.44 + size / 2,
    top: birdY,
    bottom: birdY + size,
  };
}

function drawBird(context, width, height, deltaSeconds, isPlaying) {
  const size = Math.min(Math.min(width, height) * 0.075, 64);
  const x = width * 0.44 - size / 2;
  const gravity = 900;
  deltaSeconds = Math.min(deltaSeconds, 0.05);

  if (birdY === null) {
    resetBird(width, height);
  }

  if (isPlaying) {
    birdVelocity += gravity * deltaSeconds;
    birdY = Math.max(0, Math.min(birdY + birdVelocity * deltaSeconds, height - size));

    if (birdY === 0 && birdVelocity < 0) {
      birdVelocity = 0;
    }

    if (birdY === height - size) {
      birdVelocity = 0;
    }
  }

  context.fillStyle = "#ffd52a";
  context.fillRect(x, birdY, size, size);

  return birdY === height - size;
}