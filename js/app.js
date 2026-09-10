/**
 * CyberArcade & AWS CI/CD Hub - Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Tabs
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      soundManager.playBeep(520);

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // 2. Sound Mute Button
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      if (soundIcon) {
        soundIcon.innerHTML = isMuted
          ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
          : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    });
  }

  // 3. Theme Picker
  const themeSelect = document.getElementById('theme-picker');
  const savedTheme = localStorage.getItem('cyberarcade_theme') || 'cyber';

  if (themeSelect) {
    themeSelect.value = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      document.documentElement.setAttribute('data-theme', selected);
      localStorage.setItem('cyberarcade_theme', selected);
      soundManager.playBeep(660);
    });
  }

  // 4. Modal Handler
  const modalOverlay = document.getElementById('info-modal');
  const openModalBtn = document.getElementById('open-info-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (openModalBtn && modalOverlay) {
    openModalBtn.addEventListener('click', () => {
      modalOverlay.classList.add('open');
      soundManager.playBeep(440);
    });
  }

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('open');
    }
  });

  // 5. Initialize Components
  window.runnerGame = new CyberRunnerGame('game-canvas');
  window.memoryGame = new QuantumMemoryGame();
  window.pipelineSimulator = new PipelineSimulator();

  console.log('🚀 CyberArcade & AWS CI/CD Application Initialized Successfully.');
});
