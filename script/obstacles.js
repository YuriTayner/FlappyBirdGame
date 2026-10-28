let obstacles = [];
let obstacleElapsed = 0;

const obstacleInterval = 2;
const obstacleSpeed = 210;

function createObstacle(width, height) {
  const gapHeight = Math.min(height * 0.55, Math.max(140, height * 0.32));
  const margin = gapHeight / 2 + 24;
  const minGapCenter = Math.min(margin, height / 2);
  const maxGapCenter = Math.max(height - margin, height / 2);
  const gapCenter = minGapCenter + Math.random() * (maxGapCenter - minGapCenter);

  return {
    x: width + 40,
    width: Math.max(48, Math.min(72, width * 0.09)),
    gapTop: gapCenter - gapHeight / 2,
    gapBottom: gapCenter + gapHeight / 2,
  };
}

function resetObstacles() {
  obstacles = [];
  obstacleElapsed = obstacleInterval - 0.6;
}

function drawObstacles(context, width, height, deltaSeconds, isPlaying) {
  if (isPlaying) {
    obstacleElapsed += deltaSeconds;

    while (obstacleElapsed >= obstacleInterval) {
      obstacles.push(createObstacle(width, height));
      obstacleElapsed -= obstacleInterval;
    }

    for (const obstacle of obstacles) {
      obstacle.x -= obstacleSpeed * deltaSeconds;
    }

    obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width >= 0);
  }

  for (const obstacle of obstacles) {
    drawObstacle(context, obstacle, height);
  }
}

function drawObstacle(context, obstacle, height) {
  const capHeight = 18;
  const capOverhang = 6;

  context.fillStyle = "#328f48";
  context.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapTop);
  context.fillRect(
    obstacle.x,
    obstacle.gapBottom,
    obstacle.width,
    height - obstacle.gapBottom,
  );

  context.fillStyle = "#45ad5b";
  context.fillRect(
    obstacle.x - capOverhang,
    obstacle.gapTop - capHeight,
    obstacle.width + capOverhang * 2,
    capHeight,
  );
  context.fillRect(
    obstacle.x - capOverhang,
    obstacle.gapBottom,
    obstacle.width + capOverhang * 2,
    capHeight,
  );
}

function hasObstacleCollision(width, height) {
  const bird = getBirdBounds(width, height);

  return obstacles.some((obstacle) => {
    const overlapsHorizontally =
      bird.right > obstacle.x && bird.left < obstacle.x + obstacle.width;
    const outsideGap =
      bird.top < obstacle.gapTop || bird.bottom > obstacle.gapBottom;

    return overlapsHorizontally && outsideGap;
  });
}
