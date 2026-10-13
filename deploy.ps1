param(
    [string]$VmUser = "azureuser",
    [string]$VmHost = "40.81.20.114",
    [string]$VmPath = "/home/azureuser/projects/portfolio-site",
    [string]$SshKey = "$HOME\.ssh\id_ed25519"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Portfolio Deploy to Azure VM" -ForegroundColor Cyan
Write-Host "  (Optimized Tarball Method)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Build ───────────────────────────────────────────────
Write-Host "[1/5] Building Next.js (standalone)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Build complete." -ForegroundColor Green

# ─── Step 2: Stage Files ─────────────────────────────────────────
Write-Host "[2/5] Preparing files for compression..." -ForegroundColor Yellow
$StageDir = ".\.deploy_stage"
if (Test-Path $StageDir) { Remove-Item -Recurse -Force $StageDir }
New-Item -ItemType Directory -Path $StageDir | Out-Null

# Copy standalone server
Copy-Item -Recurse .\.next\standalone\* $StageDir\ -Force

# Copy static assets
New-Item -ItemType Directory -Path "$StageDir\.next" -Force | Out-Null
Copy-Item -Recurse .\.next\static "$StageDir\.next\" -Force

# Copy public assets
Copy-Item -Recurse .\public $StageDir\ -Force
# Protect the uploads directory from being bundled and overwriting the VM's uploads
if (Test-Path "$StageDir\public\uploads") {
    Remove-Item -Recurse -Force "$StageDir\public\uploads"
}
Write-Host "  Files staged." -ForegroundColor Green

# ─── Step 3: Compress ────────────────────────────────────────────
Write-Host "[3/5] Compressing files into a single archive (this makes uploading 10x faster)..." -ForegroundColor Yellow
if (Test-Path ".\deploy.tar.gz") { Remove-Item -Force ".\deploy.tar.gz" }
# Windows 10/11 has native tar support
tar -czf deploy.tar.gz -C $StageDir .
Remove-Item -Recurse -Force $StageDir
Write-Host "  Archive created (deploy.tar.gz)." -ForegroundColor Green

# ─── Step 4: Upload ──────────────────────────────────────────────
Write-Host "[4/5] Uploading archive to VM... (You will be prompted for your password)" -ForegroundColor Yellow
scp -i $SshKey deploy.tar.gz "${VmUser}@${VmHost}:/tmp/deploy.tar.gz"
Write-Host "  Upload complete." -ForegroundColor Green

# ─── Step 5: Extract and Restart ─────────────────────────────────
Write-Host "[5/5] Extracting on VM and restarting PM2... (You will be prompted for your password again)" -ForegroundColor Yellow
$RemoteCommand = @"
mkdir -p ${VmPath}/public/uploads &&
tar -xzf /tmp/deploy.tar.gz -C ${VmPath}/ &&
rm /tmp/deploy.tar.gz &&
pm2 restart portfolio || pm2 restart all &&
pm2 status
"@

ssh -i $SshKey "${VmUser}@${VmHost}" $RemoteCommand

# Clean up local archive
if (Test-Path ".\deploy.tar.gz") { Remove-Item -Force ".\deploy.tar.gz" }

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
