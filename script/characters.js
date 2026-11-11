
const characters = [
  { name: "Clássico", color: "#ffd52a" },
  { name: "Vermelho", color: "#f04f50" },
  { name: "Azul", color: "#44b5f1" },
  { name: "Verde", color: "#43c879" },
  { name: "Roxo", color: "#ad79eb" },
  { name: "Dourado", color: "#f4b942" }
];

let selectedCharacter = 0;

// Recuperar personagem salvo
try {
  const saved = Number(
    localStorage.getItem("flappy-character")
  );

  if (
    Number.isInteger(saved) &&
    saved >= 0 &&
    saved < characters.length
  ) {
    selectedCharacter = saved;
  }
} catch (error) {
  // Continua funcionando sem armazenamento.
}

function getSelectedCharacter() {
  return characters[selectedCharacter];
}

function selectCharacter(index) {
  if (!characters[index]) return;

  selectedCharacter = index;

  try {
    localStorage.setItem(
      "flappy-character",
      String(index)
    );
  } catch (error) {
    // A escolha continua válida durante a sessão.
  }

  renderCharacterOptions();
  updateCharacterPreview();
}

function updateCharacterPreview() {
  const preview = document.getElementById(
    "character-preview"
  );

  const name = document.getElementById(
    "selected-character-name"
  );

  const character = getSelectedCharacter();

  if (preview) {
    preview.style.backgroundColor = character.color;
  }

  if (name) {
    name.textContent = character.name;
  }
}

function renderCharacterOptions() {
  const container = document.getElementById(
    "character-options"
  );

  if (!container) return;

  container.replaceChildren();

  characters.forEach((character, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "character-option";

    button.style.setProperty(
      "--bird-color",
      character.color
    );

    button.setAttribute(
      "aria-pressed",
      String(index === selectedCharacter)
    );

    const bird = document.createElement("span");
    bird.className = "character-option__bird";

    const label = document.createElement("span");
    label.textContent = character.name;

    button.append(bird, label);

    button.addEventListener("click", () => {
      selectCharacter(index);
    });

    container.appendChild(button);
  });
}

// Inicializar menu
document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.getElementById(
    "characters-button"
  );

  const closeButton = document.getElementById(
    "characters-close"
  );

  const menu = document.getElementById(
    "characters-menu"
  );

  if (!openButton || !closeButton || !menu) return;

  function closeMenu() {
    menu.hidden = true;
    openButton.focus();
  }

  openButton.addEventListener("click", () => {
    renderCharacterOptions();
    updateCharacterPreview();

    menu.hidden = false;
    closeButton.focus();
  });

  closeButton.addEventListener("click", closeMenu);

  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
    }
  });

  updateCharacterPreview();
});
