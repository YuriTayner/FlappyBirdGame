
let obstacles = [];
let obstacleElapsed = 0;

const obstacleInterval = 2;
const obstacleSpeed = 210;

let suddenDeathWarningTime = 0;
let suddenDeathWasActive = false;

// Dificuldade de acordo com a distância
function getDifficultySettings() {
  const meters = typeof distanceMeters === "number"
    ? distanceMeters
    : 0;

  if (meters >= 300) {
    return {
      speed: obstacleSpeed * 1.7,
      interval: 1.45,
      gapMultiplier: 0.68,
      level: 3,
      label: "+70%"
    };
  }

  if (meters >= 200) {
    return {
      speed: obstacleSpeed * 1.5,
      interval: 1.6,
      gapMultiplier: 0.76,
      level: 2,
      label: "+50%"
    };
  }

  if (meters >= 100) {
    return {
      speed: obstacleSpeed * 1.3,
      interval: 1.8,
      gapMultiplier: 0.87,
      level: 1,
      label: "+30%"
    };
  }

  return {
    speed: obstacleSpeed,
    interval: obstacleInterval,
    gapMultiplier: 1,
    level: 0,
    label: "Normal"
  };
}

function isSuddenDeathActive() {
  return getDifficultySettings().level > 0;
}

function createObstacle(width, height) {
  const difficulty = getDifficultySettings();

  const normalGap = Math.min(
    height * 0.55,
    Math.max(140, height * 0.32)
  );

  // A passagem diminui conforme a dificuldade
  const gapHeight = Math.min(
    height * 0.8,
    Math.max(
      108,
      normalGap * difficulty.gapMultiplier
    )
  );

  const margin = gapHeight / 2 + 24;

  const minGapCenter = Math.min(
    margin,
    height / 2
  );

  const maxGapCenter = Math.max(
    height - margin,
    height / 2
  );

  const gapCenter =
    minGapCenter +
    Math.random() * (maxGapCenter - minGapCenter);

  return {
    x: width + 40,
    width: Math.max(
      48,
      Math.min(72, width * 0.09)
    ),
    gapTop: gapCenter - gapHeight / 2,
    gapBottom: gapCenter + gapHeight / 2
  };
}

function resetObstacles() {
  obstacles = [];
  obstacleElapsed = obstacleInterval - 0.6;

  suddenDeathWarningTime = 0;
  suddenDeathWasActive = false;
}

function drawObstacles(
  context,
  width,
  height,
  deltaSeconds,
  isPlaying
) {
  const difficulty = getDifficultySettings();

  if (isPlaying) {
    // Detectar o início da morte súbita
    if (difficulty.level > 0 && !suddenDeathWasActive) {
      suddenDeathWasActive = true;
      suddenDeathWarningTime = 3;
    }

    suddenDeathWarningTime = Math.max(
      0,
      suddenDeathWarningTime - deltaSeconds
    );

    obstacleElapsed += deltaSeconds;

    // Obstáculos aparecem mais rapidamente
    while (obstacleElapsed >= difficulty.interval) {
      obstacles.push(createObstacle(width, height));

      obstacleElapsed -= difficulty.interval;
    }

    // Aumentar velocidade
    for (const obstacle of obstacles) {
      obstacle.x -= difficulty.speed * deltaSeconds;
    }

    obstacles = obstacles.filter(
      obstacle => obstacle.x + obstacle.width >= 0
    );
  }

  for (const obstacle of obstacles) {
    drawObstacle(context, obstacle, height);
  }

  // Aviso da morte súbita
  if (difficulty.level > 0 && isPlaying) {
    drawSuddenDeathIndicator(context, width, difficulty);
  }
}

function drawSuddenDeathIndicator(
  context,
  width,
  difficulty
) {
  context.save();

  context.textAlign = "center";
  context.textBaseline = "middle";

  // Aviso grande ao entrar na morte súbita
  if (suddenDeathWarningTime > 0) {
    context.fillStyle = "rgba(135,0,0,0.85)";

    context.fillRect(
      width / 2 - 150,
      115,
      300,
      65
    );

    context.font = "bold 24px system-ui";
    context.fillStyle = "#ffffff";

    context.fillText(
      "☠ MORTE SÚBITA!",
      width / 2,
      147
    );
  } else {
    // Indicador permanente de dificuldade
    context.fillStyle = "rgba(120,0,0,0.75)";

    context.fillRect(
      width / 2 - 95,
      125,
      190,
      35
    );

    context.font = "bold 15px system-ui";
    context.fillStyle = "#ffffff";

    context.fillText(
      `MORTE SÚBITA ${difficulty.label}`,
      width / 2,
      143
    );
  }

  context.restore();
}

function drawObstacle(context, obstacle, height) {
  const capHeight = 18;
  const capOverhang = 6;

  context.fillStyle = "#328f48";

  context.fillRect(
    obstacle.x,
    0,
    obstacle.width,
    obstacle.gapTop
  );

  context.fillRect(
    obstacle.x,
    obstacle.gapBottom,
    obstacle.width,
    height - obstacle.gapBottom
  );

  context.fillStyle = "#45ad5b";

  context.fillRect(
    obstacle.x - capOverhang,
    obstacle.gapTop - capHeight,
    obstacle.width + capOverhang * 2,
    capHeight
  );

  context.fillRect(
    obstacle.x - capOverhang,
    obstacle.gapBottom,
    obstacle.width + capOverhang * 2,
    capHeight
  );
}

function hasObstacleCollision(width, height) {
  const bird = getBirdBounds(width, height);

  return obstacles.some(obstacle => {
    const overlapsHorizontally =
      bird.right > obstacle.x &&
      bird.left < obstacle.x + obstacle.width;

    const outsideGap =
      bird.top < obstacle.gapTop ||
      bird.bottom > obstacle.gapBottom;

    return overlapsHorizontally && outsideGap;
  });
}

function getAutopilotTargetY(width, height) {
  const bird = getBirdBounds(width, height);

  const nextObstacle = obstacles.find(
    obstacle =>
      obstacle.x + obstacle.width >= bird.left
  );

  if (!nextObstacle) {
    return height / 2 -
      (bird.bottom - bird.top) / 2;
  }

  const birdSize = bird.bottom - bird.top;

  return nextObstacle.gapTop +
    (
      nextObstacle.gapBottom -
      nextObstacle.gapTop -
      birdSize
    ) / 2;
}
