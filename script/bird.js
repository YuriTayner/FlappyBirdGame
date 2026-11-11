
let birdY = null;
let birdVelocity = 0;
const birdGravity = 900;

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

function updateBirdAutopilot(targetY) {
  if (birdY > targetY + 8 && birdVelocity > -40) {
    jumpBird();
  }
}

function drawBird(context, width, height, deltaSeconds, isPlaying) {
  const size = Math.min(Math.min(width, height) * 0.075, 64);
  const x = width * 0.44 - size / 2;

  deltaSeconds = Math.min(deltaSeconds, 0.05);

  if (birdY === null) {
    resetBird(width, height);
  }

  if (isPlaying) {
    birdVelocity += birdGravity * deltaSeconds;

    birdY = Math.max(
      0,
      Math.min(
        birdY + birdVelocity * deltaSeconds,
        height - size
      )
    );

    if (birdY === 0 && birdVelocity < 0) {
      birdVelocity = 0;
    }

    if (birdY === height - size) {
      birdVelocity = 0;
    }
  }

  const isImmune = isBirdImmune();
  const isBlinkVisible = !isImmune || isBirdBlinkVisible();

  // Recupera o personagem escolhido no menu
  const character = getSelectedCharacter();

  context.save();
  context.globalAlpha = isBlinkVisible ? 1 : 0.25;

  if (isImmune) {
    context.shadowColor = "#ffe16a";
    context.shadowBlur = 22;
    context.strokeStyle = "#fffdf2";
    context.lineWidth = 3;
    context.strokeRect(x, birdY, size, size);
  }

  // Corpo com a cor do personagem selecionado
  context.fillStyle = isImmune ? "#ffe16a" : character.color;
  context.fillRect(x, birdY, size, size);

  // Asa
  context.fillStyle = "rgba(255,255,255,0.35)";
  context.beginPath();
  context.ellipse(
    x + size * 0.35,
    birdY + size * 0.67,
    size * 0.23,
    size * 0.15,
    -0.25,
    0,
    Math.PI * 2
  );
  context.fill();

  // Olho branco
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(
    x + size * 0.7,
    birdY + size * 0.3,
    size * 0.13,
    0,
    Math.PI * 2
  );
  context.fill();

  // Pupila
  context.fillStyle = "#222222";
  context.beginPath();
  context.arc(
    x + size * 0.73,
    birdY + size * 0.3,
    size * 0.055,
    0,
    Math.PI * 2
  );
  context.fill();

  // Bico
  context.fillStyle = "#f28c28";
  context.beginPath();
  context.moveTo(x + size * 0.9, birdY + size * 0.43);
  context.lineTo(x + size * 1.1, birdY + size * 0.53);
  context.lineTo(x + size * 0.9, birdY + size * 0.63);
  context.closePath();
  context.fill();

  context.restore();

  return birdY === height - size;
}
