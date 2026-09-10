/**
 * Interactive AWS CI/CD Pipeline Simulator
 * Visualizes AWS CodePipeline & AWS CodeBuild lifecycle with animated log output.
 */

class PipelineSimulator {
  constructor() {
    this.stages = ['stage-source', 'stage-codebuild', 'stage-test', 'stage-deploy'];
    this.isBuilding = false;
    this.totalBuilds = parseInt(localStorage.getItem('aws_pipeline_total_builds') || '1', 10);
    this.successfulBuilds = parseInt(localStorage.getItem('aws_pipeline_success_builds') || '1', 10);

    this.terminalEl = document.getElementById('pipeline-terminal-output');
    this.triggerBtn = document.getElementById('trigger-build-btn');

    this.bindEvents();
    this.updateStats();
  }

  bindEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => {
        if (!this.isBuilding) this.runPipelineSimulation();
      });
    }

    const clearLogBtn = document.getElementById('clear-logs-btn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => {
        if (this.terminalEl) this.terminalEl.innerHTML = '<div class="term-line info">[AWS-CodeBuild] Ready for next build trigger.</div>';
      });
    }
  }

  appendLog(text, type = 'info') {
    if (!this.terminalEl) return;
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.innerText = `[${timestamp}] ${text}`;
    this.terminalEl.appendChild(line);
    this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
  }

  setStageState(stageId, state) {
    const stageEl = document.getElementById(stageId);
    if (!stageEl) return;

    stageEl.classList.remove('active', 'success', 'failed');
    if (state) stageEl.classList.add(state);
  }

  async runPipelineSimulation() {
    this.isBuilding = true;
    if (this.triggerBtn) {
      this.triggerBtn.disabled = true;
      this.triggerBtn.innerText = '⚡ Pipeline Running...';
    }

    soundManager.init();
    soundManager.playBeep(440);

    this.stages.forEach(id => this.setStageState(id, null));
    this.appendLog('=== INITIATING AWS CI/CD PIPELINE EXECUTION ===', 'info');

    try {
      // Step 1: Source (GitHub)
      this.setStageState('stage-source', 'active');
      this.appendLog('GitHub Webhook: Commit detected in branch [main]', 'info');
      this.appendLog('Source repository: https://github.com/AnujThorat/myfirst-cicd-project.git', 'info');
      await this.delay(1000);
      this.setStageState('stage-source', 'success');
      soundManager.playBeep(523.25);

      // Step 2: CodeBuild (Provision & Install)
      this.setStageState('stage-codebuild', 'active');
      this.appendLog('AWS CodeBuild: Provisioning container image aws/codebuild/standard:7.0...', 'info');
      this.appendLog('Executing buildspec.yml phase [INSTALL]: nodejs 20 installed.', 'info');
      await this.delay(1200);
      this.appendLog('Executing buildspec.yml phase [PRE_BUILD]: node scripts/build-check.js', 'info');
      this.appendLog('✔ All HTML5/CSS/JS assets validated.', 'success');
      this.appendLog('✔ Generated build metadata stamped into build-info.json', 'success');
      await this.delay(1000);
      this.setStageState('stage-codebuild', 'success');
      soundManager.playBeep(659.25);

      // Step 3: Test & Lint
      this.setStageState('stage-test', 'active');
      this.appendLog('Executing automated test suite: 0 errors found.', 'success');
      this.appendLog('Web Audio API and Canvas rendering engine verified.', 'success');
      await this.delay(1100);
      this.setStageState('stage-test', 'success');
      soundManager.playBeep(783.99);

      // Step 4: Deploy (S3 & CloudFront)
      this.setStageState('stage-deploy', 'active');
      this.appendLog('Executing buildspec-deploy: aws s3 sync . s3://cyberarcade-live-hosting --delete', 'info');
      this.appendLog('Sync completed: 14 files transferred (100% upload speed)', 'success');
      this.appendLog('AWS CloudFront: Invalidation request ID #INV-94827 completed.', 'success');
      await this.delay(1200);
      this.setStageState('stage-deploy', 'success');
      soundManager.playVictory();

      this.appendLog('=== PIPELINE SUCCESS: STATIC SITE IS LIVE ON S3 & CLOUDFRONT! ===', 'success');

      this.totalBuilds++;
      this.successfulBuilds++;
      localStorage.setItem('aws_pipeline_total_builds', this.totalBuilds.toString());
      localStorage.setItem('aws_pipeline_success_builds', this.successfulBuilds.toString());
      this.updateStats();

    } catch (err) {
      this.appendLog(`Pipeline failed with error: ${err.message}`, 'error');
      soundManager.playExplosion();
    } finally {
      this.isBuilding = false;
      if (this.triggerBtn) {
        this.triggerBtn.disabled = false;
        this.triggerBtn.innerText = '🚀 Trigger AWS Pipeline';
      }
    }
  }

  updateStats() {
    const totalEl = document.getElementById('stat-total-builds');
    const successRateEl = document.getElementById('stat-success-rate');

    if (totalEl) totalEl.innerText = this.totalBuilds.toString();
    if (successRateEl) {
      const rate = Math.round((this.successfulBuilds / Math.max(1, this.totalBuilds)) * 100);
      successRateEl.innerText = `${rate}%`;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
