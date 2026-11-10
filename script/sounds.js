let audioContext = null;
let gameOverMusicGain = null;
let backgroundMusicGain = null;
let backgroundMusicTimer = null;

const backgroundMusicLoopDuration = 2.88;
const backgroundMelody = [
  659.25, 783.99, 987.77, 783.99,
  880, 783.99, 659.25, 523.25,
  587.33, 659.25, 783.99, 659.25,
  587.33, 523.25, 587.33, 659.25,
];

function initializeSounds() {
  const AudioContextConstructor =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  stopGameOverMusic();
}

function scheduleMusicTone(frequency, startTime, duration, volume, output) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const endTime = startTime + duration;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(startTime);
  oscillator.stop(endTime);
}

function scheduleBackgroundMusicLoop(startTime) {
  const noteDuration = 0.15;

  backgroundMelody.forEach((frequency, index) => {
    scheduleMusicTone(
      frequency,
      startTime + index * 0.18,
      noteDuration,
      0.18,
      backgroundMusicGain,
    );
  });

  [220, 196, 165, 196].forEach((frequency, index) => {
    scheduleMusicTone(
      frequency,
      startTime + index * 0.72,
      0.58,
      0.045,
      backgroundMusicGain,
    );
  });
}

function startBackgroundMusic() {
  if (!audioContext || backgroundMusicGain) {
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().then(startBackgroundMusic);
    return;
  }

  if (audioContext.state !== "running") {
    return;
  }

  const now = audioContext.currentTime;
  backgroundMusicGain = audioContext.createGain();
  backgroundMusicGain.gain.setValueAtTime(0.0001, now);
  backgroundMusicGain.gain.exponentialRampToValueAtTime(0.16, now + 0.3);
  backgroundMusicGain.connect(audioContext.destination);

  scheduleBackgroundMusicLoop(now + 0.05);
  backgroundMusicTimer = window.setInterval(() => {
    if (audioContext.state === "running" && backgroundMusicGain) {
      scheduleBackgroundMusicLoop(audioContext.currentTime + 0.05);
    }
  }, backgroundMusicLoopDuration * 1000);
}

function stopBackgroundMusic() {
  if (backgroundMusicTimer !== null) {
    window.clearInterval(backgroundMusicTimer);
    backgroundMusicTimer = null;
  }

  if (!audioContext || !backgroundMusicGain) {
    return;
  }

  const now = audioContext.currentTime;
  backgroundMusicGain.gain.cancelScheduledValues(now);
  backgroundMusicGain.gain.setTargetAtTime(0.0001, now, 0.08);
  backgroundMusicGain = null;
}

function playTone(frequency, startTime, duration, volume, type = "sine") {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime);
}

function playCoinSound() {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const now = audioContext.currentTime;
  playTone(880, now, 0.12, 0.12);
  playTone(1320, now + 0.07, 0.16, 0.09);
}

function playPowerUpSound() {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const now = audioContext.currentTime;
  playTone(523.25, now, 0.18, 0.1, "triangle");
  playTone(783.99, now + 0.12, 0.24, 0.12, "triangle");
}

function playPowerUpActivationSound() {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(320, now);
  oscillator.frequency.exponentialRampToValueAtTime(960, now + 0.35);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.4);
}

function stopGameOverMusic() {
  if (!audioContext || !gameOverMusicGain) {
    return;
  }

  const now = audioContext.currentTime;
  gameOverMusicGain.gain.cancelScheduledValues(now);
  gameOverMusicGain.gain.setTargetAtTime(0.0001, now, 0.04);
  gameOverMusicGain = null;
}

function playGameOverMusic() {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  stopBackgroundMusic();
  stopGameOverMusic();
  const now = audioContext.currentTime;
  const melody = [
    { frequency: 392, start: 0, duration: 0.55 },
    { frequency: 349.23, start: 0.55, duration: 0.55 },
    { frequency: 329.63, start: 1.1, duration: 0.8 },
    { frequency: 261.63, start: 1.95, duration: 1.05 },
    { frequency: 293.66, start: 3.1, duration: 0.6 },
    { frequency: 261.63, start: 3.75, duration: 1.25 },
  ];

  gameOverMusicGain = audioContext.createGain();
  gameOverMusicGain.gain.setValueAtTime(0.0001, now);
  gameOverMusicGain.gain.exponentialRampToValueAtTime(0.16, now + 0.15);
  gameOverMusicGain.connect(audioContext.destination);

  for (const note of melody) {
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();
    const noteStart = now + note.start;
    const noteEnd = noteStart + note.duration;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, noteStart);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.55, noteStart + 0.05);
    noteGain.gain.setTargetAtTime(0.0001, noteStart + 0.15, note.duration * 0.35);
    oscillator.connect(noteGain);
    noteGain.connect(gameOverMusicGain);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  }

  gameOverMusicGain.gain.setTargetAtTime(0.0001, now + 5.2, 0.2);
}
