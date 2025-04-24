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
  try {
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
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

// Spawn document
function spawnDocument() {
  try {
    documentPos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    if (snake.some(segment => segment.x === documentPos.x && segment.y === documentPos.y)) {
      spawnDocument();
    }
  } catch (error) {
    console.error('Error spawning document:', error);
  }
}

// Draw game
function draw() {
  try {
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
  } catch (error) {
    console.error('Error drawing game:', error);
  }
}

// Update game state
function update() {
  try {
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
  } catch (error) {
    console.error('Error updating game:', error);
  }
}

// Game over
function gameOver() {
  try {
    clearInterval(gameLoop);
    gameOverSound.play();
    alert(`Game Over! Score: ${score}`);
    initGame();
    startGame();
  } catch (error) {
    console.error('Error in game over:', error);
  }
}

// Start game
function startGame() {
  try {
    clearInterval(gameLoop);
    initGame();
    gameLoop = setInterval(update, speed);
  } catch (error) {
    console.error('Error starting game:', error);
  }
}

// Share score
function shareScore() {
  try {
    const text = `I scored ${score} in SignSnake! Play now at https://signsnake.vercel.app @sign #SignSnake`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`);
  } catch (error) {
    console.error('Error sharing score:', error);
  }
}

// Toggle sound
function toggleSound() {
  try {
    const muted = !document.getElementById('sound-toggle').checked;
    collectSound.muted = muted;
    gameOverSound.muted = muted;
  } catch (error) {
    console.error('Error toggling sound:', error);
  }
}

// Handle keyboard input
document.addEventListener('keydown', e => {
  try {
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
  } catch (error) {
    console.error('Error handling keydown:', error);
  }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
  try {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  } catch (error) {
    console.error('Error in touchstart:', error);
  }
});

canvas.addEventListener('touchmove', e => {
  try {
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
  } catch (error) {
    console.error('Error in touchmove:', error);
  }
});

// Initialize game with error handling
try {
  startGame();
} catch (error) {
  console.error('Error on page load:', error);
}
