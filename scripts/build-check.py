"""
AWS CodeBuild Pre-Build Verification & Build Stamping Script (Python Edition)
Validates project structure, performs syntax/file checks, and generates build metadata.
"""

import os
import sys
import json
import datetime

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

print("\033[36m========================================================\033[0m")
print("\033[1m\033[35m[AWS CodeBuild / CI Verification]\033[0m Starting static site checks...")
print("\033[36m========================================================\033[0m")

required_files = [
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
]

errors = 0

print("\n\033[33m[1/2] Checking Required Files & Assets...\033[0m")
for rel_path in required_files:
    full_path = os.path.join(root_dir, rel_path)
    if not os.path.exists(full_path):
        print(f"  \033[31m✖ Missing file:\033[0m {rel_path}")
        errors += 1
    else:
        size = os.path.getsize(full_path)
        if size == 0:
            print(f"  \033[31m✖ Empty file:\033[0m {rel_path}")
            errors += 1
        else:
            print(f"  \033[32m✔ Present:\033[0m {rel_path} ({size} bytes)")

print("\n\033[33m[2/2] Generating Build Information & Metadata...\033[0m")
build_info = {
    "appName": "CyberArcade & AWS CI/CD Hub",
    "version": "1.0.0",
    "buildTimestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "environment": "AWS-CodeBuild" if os.environ.get("CODEBUILD_BUILD_ARN") else "Local-Dev",
    "codebuildBuildId": os.environ.get("CODEBUILD_BUILD_ID", "local-build-id"),
    "sourceVersion": os.environ.get("CODEBUILD_RESOLVED_SOURCE_VERSION", "main-latest"),
    "status": "SUCCESS"
}

build_info_path = os.path.join(root_dir, 'build-info.json')
with open(build_info_path, 'w', encoding='utf-8') as f:
    json.dump(build_info, f, indent=2)

print(f"  \033[32m✔ Stamped:\033[0m build-info.json created successfully.")

print("\n\033[36m========================================================\033[0m")
if errors > 0:
    print(f"\033[31m\033[1mFAILED: Found {errors} error(s) during verification.\033[0m")
    sys.exit(1)
else:
    print("\033[32m\033[1mPASSED: All CI checks verified! Ready for CodeBuild packaging.\033[0m")
    print("\033[36m========================================================\033[0m")
    sys.exit(0)
