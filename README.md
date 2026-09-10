# CyberArcade & AWS CI/CD Pipeline Hub ⚡🎮

[![AWS CodeBuild Ready](https://img.shields.io/badge/AWS-CodeBuild%20Ready-orange?logo=amazon-aws)](DEPLOYMENT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5 / Canvas 2D](https://img.shields.io/badge/Tech-HTML5%20%7C%20Canvas%202D-green)](index.html)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-purple)](js/audio.js)

A futuristic, high-performance static web application featuring 60 FPS HTML5 Canvas arcade games, real-time procedural Web Audio sound synthesis, dynamic themes, and an interactive **AWS CI/CD Pipeline Simulator** configured for deployment with **AWS CodeBuild**, **Amazon S3**, and **AWS CodePipeline**.

---

## 🌟 Key Features

1. 🕹️ **Neon Cyber Surge (Arcade Runner)**:
   - 60 FPS Canvas-based dodging and reflex game.
   - Power-ups (Shield, Multiplier, Energy Orbs), dynamic particle explosions, and high score tracking via `localStorage`.
   - Responsive touch on-screen controls for mobile and full keyboard support (WASD / Arrows / Spacebar).

2. 🧩 **Quantum Memory Decryptor**:
   - Cyberpunk cipher pattern and memory sequence game.
   - Dynamic audio tones per node and difficulty scaling.

3. ⚡ **AWS CI/CD Pipeline Simulator**:
   - Interactive visualizer modeling the full GitHub ➔ AWS CodeBuild ➔ Automated Testing ➔ Amazon S3 / CloudFront deployment workflow.
   - Simulated streaming terminal logs and build metrics.

4. 🔊 **Procedural Web Audio FX**:
   - Native Web Audio API sound synthesis (lasers, explosions, chimes, powerup sounds) with **zero external sound files** needed and instantaneous load.

5. 🎨 **Glassmorphic Cyber Themes**:
   - Cyber Neon, Synthwave Purple, Emerald Matrix, and Solar Flare palettes.

---

## 📁 Repository Structure & File Requirements

| File / Directory | Purpose | AWS CodeBuild Role |
| :--- | :--- | :--- |
| `buildspec.yml` | **Main AWS CodeBuild Specification** | Declares build environment, runtimes, pre-build validation, packaging & artifacts. |
| `buildspec-deploy.yml` | **Direct S3 Deployment Spec** | Extended spec with automated `aws s3 sync` and CloudFront invalidation commands. |
| `scripts/build-check.js` | **CI Integrity & Validation Suite** | Runs during CodeBuild `pre_build` to verify asset presence, syntax, and stamp `build-info.json`. |
| `DEPLOYMENT.md` | **AWS Deployment Documentation** | Step-by-step tutorial for CodeBuild, IAM, S3 Static Web Hosting, and GitHub webhooks. |
| `package.json` | **Project Manifest & Scripts** | Provides `npm test`, `npm start`, and build automation scripts. |
| `index.html` | **Main Entrypoint** | Semantic HTML5 web application structure. |
| `css/main.css` & `css/games.css` | **Styling** | Design system, glassmorphic cards, themes, and game viewports. |
| `js/` | **Application Logic** | Game engines, sound synthesis, and pipeline visualizer. |

---

## 🚀 Local Development & Preview

You can run and test the website locally using any static web server:

### Option 1: Python
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js / NPM
```bash
# Run automated CI validation checks
npm test

# Run local preview server
npx serve . -l 3000
```

---

## ☁️ How to Deploy on AWS CodeBuild & S3

1. Push this code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: add CyberArcade static website and AWS CodeBuild buildspec"
   git push origin main
   ```
2. In AWS Console, create an **S3 Bucket** with *Static Website Hosting* enabled.
3. In **AWS CodeBuild**, create a project linked to your GitHub repo `https://github.com/AnujThorat/myfirst-cicd-project.git`.
4. Point buildspec to `buildspec.yml` and output artifacts to your S3 bucket.
5. Hit **Start Build**!

For detailed step-by-step instructions with IAM policies and screenshots, read [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📜 License
MIT License. Created for [AnujThorat/myfirst-cicd-project](https://github.com/AnujThorat/myfirst-cicd-project.git).
