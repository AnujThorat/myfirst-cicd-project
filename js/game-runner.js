/**
 * Neon Cyber Surge - 60 FPS Canvas Arcade Engine
 */

class CyberRunnerGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Virtual resolution
    this.width = 800;
    this.height = 480;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game state
    this.isRunning = false;
    this.isGameOver = false;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyber_runner_highscore') || '0', 10);
    this.multiplier = 1;
    this.shieldActive = false;
    this.shieldTime = 0;
    this.speed = 5;

    // Player
    this.player = {
      x: 100,
      y: this.height / 2,
      width: 44,
      height: 24,
      vy: 0,
      speed: 7,
      color: '#00f0ff'
    };

    // Entities & Particles
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.gridOffset = 0;

    // Controls
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.spawnTimer = 0;
    this.lastTime = 0;

    this.bindEvents();
    this.updateHUD();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (e.code === 'Space' && !this.isRunning && !this.isGameOver) {
        this.start();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
    });

    // Touch controls
    const upBtn = document.getElementById('touch-up');
    const downBtn = document.getElementById('touch-down');
    const startBtn = document.getElementById('start-runner-btn');
    const restartBtn = document.getElementById('restart-runner-btn');

    if (upBtn) {
      upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.up = true; });
      upBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.up = false; });
    }
    if (downBtn) {
      downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.down = true; });
      downBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.down = false; });
    }
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.start());
    }
  }

  start() {
    soundManager.init();
    soundManager.playBeep(587.33);

    this.score = 0;
    this.multiplier = 1;
    this.speed = 5.5;
    this.shieldActive = false;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.player.y = this.height / 2;
    this.player.x = 100;

    this.isRunning = true;
    this.isGameOver = false;

    document.getElementById('runner-start-screen')?.classList.add('hidden');
    document.getElementById('runner-gameover-screen')?.classList.add('hidden');

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  gameOver() {
    this.isRunning = false;
    this.isGameOver = true;
    soundManager.playExplosion();

    // Create massive particle explosion
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: Math.random() * 5 + 2,
        color: ['#00f0ff', '#ff007f', '#ffffff'][Math.floor(Math.random() * 3)],
        alpha: 1
      });
    }

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('cyber_runner_highscore', this.highScore.toString());
      soundManager.playVictory();
    }

    this.updateHUD();

    const finalScoreEl = document.getElementById('runner-final-score');
    if (finalScoreEl) finalScoreEl.innerText = Math.floor(this.score).toString();

    const gameOverScreen = document.getElementById('runner-gameover-screen');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
  }

  spawnEntities() {
    this.spawnTimer++;
    if (this.spawnTimer % 45 === 0) {
      // Spawn Obstacle
      const type = Math.random() > 0.4 ? 'barrier' : 'laser_node';
      this.obstacles.push({
        x: this.width + 50,
        y: Math.random() * (this.height - 100) + 50,
        width: type === 'barrier' ? 24 : 18,
        height: type === 'barrier' ? Math.random() * 80 + 40 : 20,
        type: type,
        color: '#ff007f'
      });
    }

    if (this.spawnTimer % 65 === 0) {
      // Spawn Collectible Orbs
      const isPower = Math.random() > 0.8;
      this.collectibles.push({
        x: this.width + 50,
        y: Math.random() * (this.height - 80) + 40,
        radius: isPower ? 12 : 8,
        isPower: isPower,
        color: isPower ? '#00ff88' : '#ffbe0b',
        pulse: 0
      });
    }
  }

  update(dt) {
    if (!this.isRunning) return;

    // Movement
    if (this.keys.up && this.player.y > 10) this.player.y -= this.player.speed;
    if (this.keys.down && this.player.y < this.height - this.player.height - 10) this.player.y += this.player.speed;
    if (this.keys.left && this.player.x > 20) this.player.x -= this.player.speed * 0.7;
    if (this.keys.right && this.player.x < this.width - 200) this.player.x += this.player.speed * 0.7;

    // Speed progression
    this.speed += 0.001 * dt;
    this.score += (0.05 * this.multiplier * (this.speed / 4)) * dt;
    this.gridOffset = (this.gridOffset + this.speed * 0.8) % 40;

    // Shield Timer
    if (this.shieldActive) {
      this.shieldTime -= dt;
      if (this.shieldTime <= 0) {
        this.shieldActive = false;
      }
    }

    // Engine thruster particles
    if (Math.random() > 0.2) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 6,
        vx: -Math.random() * 6 - 3,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: '#00f0ff',
        alpha: 0.9
      });
    }

    this.spawnEntities();

    // Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed;

      // Collision Check
      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        if (this.shieldActive) {
          // Shield absorbs hit
          soundManager.playPowerup();
          this.shieldActive = false;
          this.obstacles.splice(i, 1);
          continue;
        } else {
          this.gameOver();
          return;
        }
      }

      if (obs.x < -100) this.obstacles.splice(i, 1);
    }

    // Update Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.speed * 0.9;
      col.pulse += 0.1;

      // Check pickup
      const dx = (this.player.x + this.player.width / 2) - col.x;
      const dy = (this.player.y + this.player.height / 2) - col.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < col.radius + this.player.width / 2) {
        if (col.isPower) {
          this.shieldActive = true;
          this.shieldTime = 400; // frames
          soundManager.playPowerup();
          this.multiplier = Math.min(this.multiplier + 1, 5);
        } else {
          soundManager.playCollect();
          this.score += 50 * this.multiplier;
        }

        // Burst particles
        for (let p = 0; p < 12; p++) {
          this.particles.push({
            x: col.x,
            y: col.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            color: col.color,
            alpha: 1
          });
        }

        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.x < -50) this.collectibles.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    this.updateHUD();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Synthwave Grid Background
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    this.ctx.lineWidth = 1;
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    for (let x = -this.gridOffset; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // 2. Draw Obstacles
    this.obstacles.forEach(obs => {
      this.ctx.fillStyle = obs.color;
      this.ctx.shadowColor = obs.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });

    // 3. Draw Collectibles
    this.collectibles.forEach(col => {
      this.ctx.beginPath();
      this.ctx.arc(col.x, col.y, col.radius + Math.sin(col.pulse) * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = col.color;
      this.ctx.shadowColor = col.color;
      this.ctx.shadowBlur = 18;
      this.ctx.fill();
    });

    // 4. Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.restore();
    });

    // 5. Draw Player Cyber-Ship
    if (this.isRunning) {
      this.ctx.save();
      this.ctx.translate(this.player.x, this.player.y);

      // Ship body
      this.ctx.fillStyle = this.player.color;
      this.ctx.shadowColor = this.player.color;
      this.ctx.shadowBlur = 15;

      this.ctx.beginPath();
      this.ctx.moveTo(this.player.width, this.player.height / 2);
      this.ctx.lineTo(0, 0);
      this.ctx.lineTo(8, this.player.height / 2);
      this.ctx.lineTo(0, this.player.height);
      this.ctx.closePath();
      this.ctx.fill();

      // Shield Aura
      if (this.shieldActive) {
        this.ctx.beginPath();
        this.ctx.arc(this.player.width / 2, this.player.height / 2, 28, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 20;
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 16.66, 2);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    if (this.isRunning) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  updateHUD() {
    const scoreEl = document.getElementById('runner-score-val');
    const highEl = document.getElementById('runner-high-val');
    const multEl = document.getElementById('runner-mult-val');

    if (scoreEl) scoreEl.innerText = Math.floor(this.score).toString();
    if (highEl) highEl.innerText = this.highScore.toString();
    if (multEl) multEl.innerText = `${this.multiplier}x`;
  }
}
