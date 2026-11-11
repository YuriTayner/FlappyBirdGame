
const rankingKey = "flappy-ranking-v1";
const playerNameKey = "flappy-player-name";

let currentPlayerName = "Jogador";

function loadRanking() {
  try {
    const data = JSON.parse(
      localStorage.getItem(rankingKey) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRanking(ranking) {
  try {
    localStorage.setItem(
      rankingKey,
      JSON.stringify(ranking)
    );
  } catch {
    // O jogo continua se o navegador bloquear o salvamento.
  }
}

function getPlayerName() {
  const input = document.getElementById("player-name");
  const name = (input?.value || "").trim().slice(0, 20);

  currentPlayerName = name || "Jogador";

  try {
    localStorage.setItem(
      playerNameKey,
      currentPlayerName
    );
  } catch {}

  return currentPlayerName;
}

function recordScore(meters, coinsCount) {
  const ranking = loadRanking();

  ranking.push({
    name: currentPlayerName,
    meters: Math.max(0, Math.floor(meters)),
    coins: Math.max(0, Math.floor(coinsCount)),
    character: typeof getSelectedCharacter === "function"
      ? getSelectedCharacter().name
      : "Clássico",
    date: new Date().toLocaleDateString("pt-BR")
  });

  ranking.sort(
    (a, b) => b.meters - a.meters || b.coins - a.coins
  );

  const topTen = ranking.slice(0, 10);
  saveRanking(topTen);

  return topTen;
}

function createRankingTable(ranking) {
  const wrapper = document.createElement("div");

  if (ranking.length === 0) {
    wrapper.textContent = "Nenhuma partida registrada ainda.";
    return wrapper;
  }

  wrapper.style.cssText = `
    width: 100%;
    overflow-x: auto;
  `;

  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    color: white;
    font: 14px system-ui, sans-serif;
  `;

  const head = document.createElement("tr");

  for (const title of ["#", "Nome", "Metros", "Moedas"]) {
    const th = document.createElement("th");
    th.textContent = title;
    th.style.cssText = "padding: 9px 5px; text-align: left;";
    head.appendChild(th);
  }

  table.appendChild(head);

  ranking.forEach((entry, index) => {
    const tr = document.createElement("tr");

    const values = [
      index + 1,
      entry.name,
      `${entry.meters} m`,
      `🪙 ${entry.coins}`
    ];

    values.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      td.style.cssText = `
        padding: 9px 5px;
        border-top: 1px solid rgba(255,255,255,0.2);
        text-align: left;
      `;

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  wrapper.appendChild(table);
  return wrapper;
}

function renderRanking() {
  const container = document.getElementById("ranking-list");
  if (!container) return;

  container.replaceChildren(
    createRankingTable(loadRanking())
  );
}

function showEndResult(meters, coinsCount) {
  const result = document.getElementById("game-result");

  if (result) {
    result.textContent =
      `${currentPlayerName}: ${meters} m e ${coinsCount} moedas`;
  }

  renderRanking();
}

document.addEventListener("DOMContentLoaded", () => {
  const startContent = document.querySelector(
    "#start-screen .game-screen__content"
  );

  const deathContent = document.querySelector(
    "#death-screen .game-screen__content"
  );

  if (!startContent || !deathContent) return;

  // Nome antes de jogar
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Nome do jogador:";
  nameLabel.htmlFor = "player-name";

  const nameInput = document.createElement("input");
  nameInput.id = "player-name";
  nameInput.maxLength = 20;
  nameInput.placeholder = "Digite seu nome";

  try {
    nameInput.value =
      localStorage.getItem(playerNameKey) || "";
  } catch {}

  nameInput.style.cssText = `
    width: min(280px, 85vw);
    padding: 12px;
    border-radius: 8px;
    border: 2px solid white;
    font: 16px system-ui, sans-serif;
    text-align: center;
  `;

  const startButton = document.getElementById("start-button");

  startContent.insertBefore(nameLabel, startButton);
  startContent.insertBefore(nameInput, startButton);

  // Resultado da partida
  const result = document.createElement("p");
  result.id = "game-result";
  result.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #ffe16a;
  `;

  deathContent.insertBefore(
    result,
    document.getElementById("restart-button")
  );

  // Ranking na tela de fim de jogo
  const rankingTitle = document.createElement("h2");
  rankingTitle.textContent = "🏆 Ranking dos jogadores";
  rankingTitle.style.cssText = `
    margin: 4px 0 0;
    font-size: 22px;
  `;

  const rankingList = document.createElement("div");
  rankingList.id = "ranking-list";
  rankingList.style.cssText = `
    width: min(440px, 88vw);
    max-height: 180px;
    overflow-y: auto;
  `;

  const restartButton = document.getElementById("restart-button");

  deathContent.insertBefore(rankingTitle, restartButton);
  deathContent.insertBefore(rankingList, restartButton);

  // Ajustar a tela de fim de jogo para caber o ranking
  deathContent.style.maxHeight = "90vh";
  deathContent.style.overflowY = "auto";
  deathContent.style.gap = "12px";
  deathContent.style.padding = "12px";

  renderRanking();
});
