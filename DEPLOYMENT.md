# AWS CodeBuild & CI/CD Deployment Guide

This guide provides complete, step-by-step instructions for deploying the **CyberArcade** static web application using **AWS CodeBuild**, **Amazon S3**, and **AWS CodePipeline**.

---

## Architecture Overview

```
[GitHub Repo] ──(Webhook Trigger)──> [AWS CodePipeline / CodeBuild]
                                                │
                                        (Run buildspec.yml)
                                        (Run scripts/build-check.js)
                                        (Package static bundle)
                                                │
                                                ▼
                                    [Amazon S3 Static Bucket]
                                                │
                                                ▼
                                   [Amazon CloudFront CDN]
                                                │
                                                ▼
                                          [End Users]
```

---

## Step 1: Create and Configure Amazon S3 Bucket

1. Log into your **AWS Management Console** and navigate to **Amazon S3**.
2. Click **Create bucket**.
   - **Bucket name**: Choose a globally unique name (e.g., `anuj-cyberarcade-hosting`).
   - **AWS Region**: Choose your preferred region (e.g., `us-east-1` or `ap-south-1`).
   - **Block Public Access settings**: 
     - If hosting directly from S3, uncheck *Block all public access* and acknowledge the warning.
3. Click **Create bucket**.
4. Enable **Static website hosting**:
   - Open your bucket > Go to the **Properties** tab.
   - Scroll to **Static website hosting** and click **Edit**.
   - Select **Enable**.
   - **Index document**: `index.html`
   - **Error document**: `index.html`
   - Click **Save changes**.
5. Add Bucket Policy (for public read):
   - Go to the **Permissions** tab > **Bucket policy** > **Edit**.
   - Paste the following policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

---

## Step 2: Configure AWS CodeBuild Project

1. Navigate to **AWS CodeBuild** in the AWS Console.
2. Click **Create build project**.
3. **Project configuration**:
   - **Project name**: `myfirst-cicd-project-build`
4. **Source**:
   - **Source provider**: Select **GitHub**.
   - Connect using OAuth or GitHub Personal Access Token.
   - Select **Repository in my GitHub account**: `https://github.com/AnujThorat/myfirst-cicd-project.git`.
   - **Primary branch**: `main`.
5. **Primary source webhook events (Optional for automated CI/CD)**:
   - Check **Rebuild every time a code change is pushed to this repository**.
   - **Event type**: `PUSH`.
6. **Environment**:
   - **Environment image**: Managed image.
   - **Operating system**: Amazon Linux (or Ubuntu).
   - **Runtime(s)**: Standard.
   - **Image**: `aws/codebuild/amazonlinux2-x86_64-standard:5.0` or `aws/codebuild/standard:7.0`.
   - **Service role**: Select *New service role* (or existing CodeBuild service role).
7. **Buildspec**:
   - Select **Use a buildspec file**.
   - **Buildspec name**: Leave empty to default to `buildspec.yml` (or enter `buildspec.yml`).
8. **Artifacts**:
   - **Type**: Select **Amazon S3**.
   - **Bucket name**: Choose your created S3 bucket (e.g., `anuj-cyberarcade-hosting`).
   - **Name**: Leave blank or set a path.
   - **Packaging**: None (files will be extracted directly to the bucket root).
   - Check **Disable artifact encryption** if serving directly to public S3 website hosting.
9. Click **Create build project**.

---

## Step 3: Run Your First Build

1. Click **Start build** in your AWS CodeBuild project.
2. Monitor the **Phase details** and **Build logs**:
   - `DOWNLOAD_SOURCE` -> Clones your GitHub repo.
   - `INSTALL` -> Sets up Node.js 20 runtime.
   - `PRE_BUILD` -> Executes `node scripts/build-check.js` to validate syntax and files.
   - `BUILD` -> Prepares static assets and build metadata.
   - `POST_BUILD` -> Verifies build completion.
   - `UPLOAD_ARTIFACTS` -> Automatically syncs static site files to your S3 bucket!
3. Open your S3 Static Website Hosting URL (available in the S3 Properties tab) to view your live deployed site!

---

## Alternative: Direct S3 Deployment via `buildspec-deploy.yml`

If you prefer AWS CodeBuild to directly run `aws s3 sync` and invalidate CloudFront caches:
1. In CodeBuild > Edit Buildspec > enter `buildspec-deploy.yml`.
2. In CodeBuild Environment Variables, add:
   - `S3_BUCKET`: `your-s3-bucket-name`
   - `CLOUDFRONT_DIST_ID`: `your-cloudfront-distribution-id` (optional)
3. Ensure the CodeBuild IAM role has `s3:PutObject`, `s3:ListBucket`, `s3:DeleteObject`, and `cloudfront:CreateInvalidation` permissions.

---

## Troubleshooting & FAQs

- **Q: Build fails in PRE_BUILD phase?**
  - Verify that all core files (`index.html`, `css/main.css`, `js/audio.js`, etc.) are committed to your GitHub branch.
  - Run `npm test` locally to diagnose syntax errors.
- **Q: S3 site shows 403 Forbidden?**
  - Ensure bucket public access is not blocked and the S3 bucket policy allows `s3:GetObject`.
  - Ensure artifact encryption is disabled in CodeBuild artifacts settings.
