# AWS CodeBuild / Local Verification Script (PowerShell Edition)

$rootDir = Split-Path -Parent $PSScriptRoot
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[AWS CodeBuild / CI Verification] Starting static site checks..." -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan

$requiredFiles = @(
    "index.html",
    "buildspec.yml",
    "buildspec-deploy.yml",
    "package.json",
    "README.md",
    "DEPLOYMENT.md",
    "css/main.css",
    "css/games.css",
    "js/audio.js",
    "js/game-runner.js",
    "js/game-memory.js",
    "js/pipeline-sim.js",
    "js/app.js"
)

$errors = 0

Write-Host ""
Write-Host "[1/2] Checking Required Files and Assets..." -ForegroundColor Yellow
foreach ($rel in $requiredFiles) {
    $fullPath = Join-Path $rootDir $rel
    if (!(Test-Path $fullPath)) {
        Write-Host "  [FAIL] Missing file: $rel" -ForegroundColor Red
        $errors++
    } else {
        $item = Get-Item $fullPath
        if ($item.Length -eq 0) {
            Write-Host "  [FAIL] Empty file: $rel" -ForegroundColor Red
            $errors++
        } else {
            $bytes = $item.Length
            Write-Host "  [OK] Present: $rel ($bytes bytes)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "[2/2] Generating Build Information and Metadata..." -ForegroundColor Yellow
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$envName = if ($env:CODEBUILD_BUILD_ARN) { "AWS-CodeBuild" } else { "Local-Dev" }
$buildId = if ($env:CODEBUILD_BUILD_ID) { $env:CODEBUILD_BUILD_ID } else { "local-build-id" }
$sourceVer = if ($env:CODEBUILD_RESOLVED_SOURCE_VERSION) { $env:CODEBUILD_RESOLVED_SOURCE_VERSION } else { "main-latest" }

$buildInfo = [PSCustomObject]@{
    appName = "CyberArcade & AWS CI/CD Hub"
    version = "1.0.0"
    buildTimestamp = $timestamp
    environment = $envName
    codebuildBuildId = $buildId
    sourceVersion = $sourceVer
    status = "SUCCESS"
}

$buildInfoJson = $buildInfo | ConvertTo-Json -Depth 4
$buildInfoPath = Join-Path $rootDir "build-info.json"
$buildInfoJson | Out-File -FilePath $buildInfoPath -Encoding utf8
Write-Host "  [OK] Stamped: build-info.json created successfully." -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
if ($errors -gt 0) {
    Write-Host "FAILED: Found $errors error(s) during verification." -ForegroundColor Red
    exit 1
} else {
    Write-Host "PASSED: All CI checks verified! Ready for CodeBuild packaging." -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Cyan
    exit 0
}
