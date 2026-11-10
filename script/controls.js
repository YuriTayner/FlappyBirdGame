window.addEventListener("keydown", (event) => {
  if (
    event.code !== "Space" ||
    event.repeat ||
    gameState !== "playing" ||
    autoPilotEnabled
  ) {
    return;
  }

  event.preventDefault();
  jumpBird();
});