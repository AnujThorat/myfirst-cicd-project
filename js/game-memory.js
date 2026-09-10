/**
 * Quantum Matrix Decryptor - Memory & Pattern Decryption Puzzle Engine
 */

class QuantumMemoryGame {
  constructor() {
    this.sequence = [];
    this.playerStep = 0;
    this.level = 1;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('quantum_memory_high') || '0', 10);
    this.isPlaying = false;
    this.acceptingInput = false;

    this.symbols = ['⚡', '◈', '✦', '▲', '⬡', '❖', '⯌', '☼'];
    this.frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];

    this.gridContainer = document.getElementById('memory-grid');
    this.initGrid();
    this.bindEvents();
    this.updateHUD();
  }

  initGrid() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const tile = document.createElement('div');
      tile.className = 'matrix-tile';
      tile.dataset.id = i.toString();

      tile.innerHTML = `
        <span class="tile-symbol">${this.symbols[i]}</span>
        <span class="tile-code">NODE_0x${(i + 1).toString(16).toUpperCase()}</span>
      `;

      tile.addEventListener('click', () => this.handleTileClick(i));
      this.gridContainer.appendChild(tile);
    }
  }

  bindEvents() {
    const startBtn = document.getElementById('start-memory-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }
  }

  startGame() {
    soundManager.init();
    soundManager.playVictory();

    this.sequence = [];
    this.level = 1;
    this.score = 0;
    this.isPlaying = true;
    this.playerStep = 0;

    const overlay = document.getElementById('memory-overlay-screen');
    if (overlay) overlay.classList.add('hidden');

    this.nextRound();
  }

  nextRound() {
    this.acceptingInput = false;
    this.playerStep = 0;
    this.updateHUD();

    // Add new random node to sequence
    const nextNode = Math.floor(Math.random() * 8);
    this.sequence.push(nextNode);

    const statusEl = document.getElementById('memory-status-msg');
    if (statusEl) statusEl.innerText = `DECRYPTING SEQUENCE... LEVEL ${this.level}`;

    // Play sequence
    setTimeout(() => {
      this.playSequence(0);
    }, 600);
  }

  playSequence(index) {
    if (index >= this.sequence.length) {
      this.acceptingInput = true;
      const statusEl = document.getElementById('memory-status-msg');
      if (statusEl) statusEl.innerText = `YOUR TURN: REPLICATE THE CIPHER SEQUENCE (${this.sequence.length} STEPS)`;
      return;
    }

    const nodeIndex = this.sequence[index];
    this.flashTile(nodeIndex, 400);

    setTimeout(() => {
      this.playSequence(index + 1);
    }, 550);
  }

  flashTile(nodeIndex, duration = 300) {
    const tile = this.gridContainer?.querySelector(`[data-id="${nodeIndex}"]`);
    if (!tile) return;

    tile.classList.add('active-flash');
    soundManager.playBeep(this.frequencies[nodeIndex], 'triangle');

    setTimeout(() => {
      tile.classList.remove('active-flash');
    }, duration);
  }

  handleTileClick(nodeIndex) {
    if (!this.isPlaying || !this.acceptingInput) return;

    soundManager.playBeep(this.frequencies[nodeIndex], 'triangle');

    if (nodeIndex === this.sequence[this.playerStep]) {
      // Correct step
      const tile = this.gridContainer?.querySelector(`[data-id="${nodeIndex}"]`);
      tile?.classList.add('correct-match');
      setTimeout(() => tile?.classList.remove('correct-match'), 200);

      this.playerStep++;

      if (this.playerStep >= this.sequence.length) {
        // Round Complete!
        this.score += this.level * 100;
        this.level++;
        soundManager.playVictory();

        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('quantum_memory_high', this.highScore.toString());
        }

        const statusEl = document.getElementById('memory-status-msg');
        if (statusEl) statusEl.innerText = `CIPHER CRACKED! PROCEEDING TO LEVEL ${this.level}`;

        setTimeout(() => this.nextRound(), 1000);
      }
    } else {
      // Mistake!
      soundManager.playExplosion();
      const tile = this.gridContainer?.querySelector(`[data-id="${nodeIndex}"]`);
      tile?.classList.add('wrong-match');
      setTimeout(() => tile?.classList.remove('wrong-match'), 400);

      this.gameOver();
    }
  }

  gameOver() {
    this.isPlaying = false;
    this.acceptingInput = false;

    const overlay = document.getElementById('memory-overlay-screen');
    const finalScoreEl = document.getElementById('memory-final-score');
    const statusEl = document.getElementById('memory-status-msg');

    if (finalScoreEl) finalScoreEl.innerText = this.score.toString();
    if (statusEl) statusEl.innerText = 'SYSTEM OVERLOAD: CIPHER BREACH FAILED';
    if (overlay) overlay.classList.remove('hidden');

    this.updateHUD();
  }

  updateHUD() {
    const levelEl = document.getElementById('memory-level-val');
    const scoreEl = document.getElementById('memory-score-val');
    const highEl = document.getElementById('memory-high-val');

    if (levelEl) levelEl.innerText = this.level.toString();
    if (scoreEl) scoreEl.innerText = this.score.toString();
    if (highEl) highEl.innerText = this.highScore.toString();
  }
}
