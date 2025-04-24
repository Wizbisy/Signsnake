const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const difficultyEl = document.getElementById('difficulty');

// Sound effects
const collectSound = new Audio('assets/collect.mp3');
const gameOverSound = new Audio('assets/gameover.mp3');

// Game settings
const settings = {
  easy: { gridSize: 40, speed: 120, canvasSize: 600 },
  medium: { gridSize: 30, speed: 80, canvasSize: 600 },
  hard: { gridSize: 20, speed: 50, canvasSize: 600 }
};

let snake, documentPos, direction, score, bestScore, gameLoop, gridSize, cellSize, speed, flash;

// Initialize game
function initGame() {
  const difficulty = difficultyEl.value;
  gridSize = settings[difficulty].gridSize;
  cellSize = settings[difficulty].canvasSize / gridSize;
  speed = settings[difficulty].speed;
  canvas.width = settings[difficulty].canvasSize;
  canvas.height = settings[difficulty].canvasSize;

  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  score = 0;
  bestScore = localStorage.getItem('bestScore') || 0;
  flash = false;
  currentScoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
  spawnDocument();
  draw();
}

// Spawn document
function spawnDocument() {
  documentPos = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
  if (snake.some(segment => segment.x === documentPos.x && segment.y === documentPos.y)) {
    spawnDocument();
  }
}

// Draw game
function draw() {
  // Clear canvas
  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake (pen)
  ctx.fillStyle = flash ? '#FFC107' : '#FF6200';
  ctx.strokeStyle = '#FFC107';
  ctx.lineWidth = 2;
  snake.forEach(segment => {
    ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    ctx.strokeRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
  });

  // Draw document
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FF6200';
  ctx.fillRect(documentPos.x * cellSize + 1, documentPos.y * cellSize + 1, cellSize - 2, cellSize - 2);
  ctx.strokeRect(documentPos.x * cellSize + 1, documentPos.y * cellSize + 1, cellSize - 2, cellSize - 2);
}

// Update game state
function update() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check collision with walls
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver();
    return;
  }

  // Check collision with self
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  // Move snake
  snake.unshift(head);

  // Check if document collected
  if (head.x === documentPos.x && head.y === documentPos.y) {
    score += 10;
    currentScoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem('bestScore', bestScore);
    }
    collectSound.play();
    flash = true;
    setTimeout(() => flash = false, 100);
    spawnDocument();
  } else {
    snake.pop();
  }

  draw();
}

// Game over
function gameOver() {
  clearInterval(gameLoop);
  gameOverSound.play();
  alert(`Game Over! Score: ${score}`);
  initGame();
  startGame();
}

// Start game
function startGame() {
  clearInterval(gameLoop);
  initGame();
  gameLoop = setInterval(update, speed);
}

// Share score
function shareScore() {
  const text = `I scored ${score} in SignSnake! Play now at ${window.location.href} @sign #SignSnake`;
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`);
}

// Toggle sound
function toggleSound() {
  const muted = !document.getElementById('sound-toggle').checked;
  collectSound.muted = muted;
  gameOverSound.muted = muted;
}

// Handle keyboard input
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touchEndX = e.touches[0].clientX;
  const touchEndY = e.touches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
    if (dx > 0 && direction.x === 0) direction = { x: 1, y: 0 }; // Right
    else if (dx < 0 && direction.x === 0) direction = { x: -1, y: 0 }; // Left
  } else if (Math.abs(dy) > 20) {
    if (dy > 0 && direction.y === 0) direction = { x: 0, y: 1 }; // Down
    else if (dy < 0 && direction.y === 0) direction = { x: 0, y: -1 }; // Up
  }
});

// Initialize game
startGame();
