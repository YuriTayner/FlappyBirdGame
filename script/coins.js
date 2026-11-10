let coins = [];
let coinSpawnIn = 0;
let coinsCollected = 0;

const coinSpeed = 210;
const coinRadius = 13;

const coinCount = document.querySelector("#coin-count");

function randomCoinInterval() {
  return 2.5 + Math.random() * 3.5;
}

function resetCoins() {
  coins = [];
  coinSpawnIn = randomCoinInterval();
  coinsCollected = 0;
  coinCount.textContent = coinsCollected;
}

function drawCoins(context, width, height, deltaSeconds, isPlaying, canCollect = true) {
  if (isPlaying) {
    coinSpawnIn -= deltaSeconds;

    while (coinSpawnIn <= 0) {
      coins.push({
        x: width + coinRadius,
        y: height * (0.18 + Math.random() * 0.64),
      });
      coinSpawnIn += randomCoinInterval();
    }

    for (const coin of coins) {
      coin.x -= coinSpeed * deltaSeconds;
    }

    if (canCollect) {
      collectCoins(width, height);
    }
    coins = coins.filter((coin) => coin.x + coinRadius >= 0);
  }

  for (const coin of coins) {
    drawCoin(context, coin);
  }
}

function collectCoins(width, height) {
  const bird = getBirdBounds(width, height);

  coins = coins.filter((coin) => {
    const overlapsHorizontally =
      bird.right > coin.x - coinRadius &&
      bird.left < coin.x + coinRadius;
    const overlapsVertically =
      bird.bottom > coin.y - coinRadius &&
      bird.top < coin.y + coinRadius;

    if (overlapsHorizontally && overlapsVertically) {
      coinsCollected += 1;
      coinCount.textContent = coinsCollected;
      playCoinSound();
      return false;
    }

    return true;
  });
}

function drawCoin(context, coin) {
  context.beginPath();
  context.arc(coin.x, coin.y, coinRadius + 5, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 213, 42, 0.25)";
  context.fill();

  context.beginPath();
  context.arc(coin.x, coin.y, coinRadius, 0, Math.PI * 2);
  context.fillStyle = "#ffd52a";
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = "#fff4c4";
  context.stroke();

  context.beginPath();
  context.arc(coin.x, coin.y, coinRadius * 0.48, 0, Math.PI * 2);
  context.lineWidth = 2;
  context.strokeStyle = "#d99b12";
  context.stroke();
}
