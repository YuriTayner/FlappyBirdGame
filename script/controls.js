window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat || gameState !== "playing") {
    return;
  }

  event.preventDefault();
  jumpBird();
});