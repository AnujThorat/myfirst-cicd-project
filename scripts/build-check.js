/**
 * AWS CodeBuild Pre-Build Verification & Build Stamping Script
 * Validates project structure, performs syntax checks, and generates build metadata.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m========================================================\x1b[0m');
console.log('\x1b[1m\x1b[35m[AWS CodeBuild / CI Verification]\x1b[0m Starting static site checks...');
console.log('\x1b[36m========================================================\x1b[0m');

const requiredFiles = [
  'index.html',
  'buildspec.yml',
  'package.json',
  'README.md',
  'DEPLOYMENT.md',
  'css/main.css',
  'css/games.css',
  'js/audio.js',
  'js/game-runner.js',
  'js/game-memory.js',
  'js/pipeline-sim.js',
  'js/app.js'
];

let errors = 0;

// 1. Check Required Files
console.log('\n\x1b[33m[1/3] Checking Required Files & Assets...\x1b[0m');
for (const relPath of requiredFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`  \x1b[31m✖ Missing file:\x1b[0m ${relPath}`);
    errors++;
  } else {
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      console.error(`  \x1b[31m✖ Empty file:\x1b[0m ${relPath}`);
      errors++;
    } else {
      console.log(`  \x1b[32m✔ Present:\x1b[0m ${relPath} (${stat.size} bytes)`);
    }
  }
}

// 2. Syntax check JS files
console.log('\n\x1b[33m[2/3] Validating JavaScript Syntax...\x1b[0m');
const jsFiles = [
  'js/audio.js',
  'js/game-runner.js',
  'js/game-memory.js',
  'js/pipeline-sim.js',
  'js/app.js'
];

for (const relPath of jsFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    try {
      const code = fs.readFileSync(fullPath, 'utf8');
      new vm.Script(code);
      console.log(`  \x1b[32m✔ Syntax OK:\x1b[0m ${relPath}`);
    } catch (err) {
      console.error(`  \x1b[31m✖ Syntax Error in ${relPath}:\x1b[0m ${err.message}`);
      errors++;
    }
  }
}

// 3. Generate Build Info / Metadata for AWS CodeBuild
console.log('\n\x1b[33m[3/3] Generating Build Information & Metadata...\x1b[0m');
const buildInfo = {
  appName: 'CyberArcade & AWS CI/CD Hub',
  version: '1.0.0',
  buildTimestamp: new Date().toISOString(),
  environment: process.env.CODEBUILD_BUILD_ARN ? 'AWS-CodeBuild' : 'Local-Dev',
  codebuildBuildId: process.env.CODEBUILD_BUILD_ID || 'local-build-id',
  sourceVersion: process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || 'main-latest',
  status: 'SUCCESS'
};

const buildInfoPath = path.join(rootDir, 'build-info.json');
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2), 'utf8');
console.log(`  \x1b[32m✔ Stamped:\x1b[0m build-info.json created successfully.`);

console.log('\n\x1b[36m========================================================\x1b[0m');
if (errors > 0) {
  console.error(`\x1b[31m\x1b[1mFAILED: Found ${errors} error(s) during verification.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32m\x1b[1mPASSED: All CI checks verified! Ready for CodeBuild packaging.\x1b[0m');
  console.log('\x1b[36m========================================================\x1b[0m');
  process.exit(0);
}
