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
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed (scp exit $LASTEXITCODE). Aborting." -ForegroundColor Red
    if (Test-Path ".\deploy.tar.gz") { Remove-Item -Force ".\deploy.tar.gz" }
    exit 1
}
Write-Host "  Upload complete." -ForegroundColor Green

# Upload production server secrets (additively merged into .env.production.local on the VM).
$DeployEnv = ".\deploy.env"
if (Test-Path $DeployEnv) {
    scp -i $SshKey $DeployEnv "${VmUser}@${VmHost}:/tmp/deploy.env"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Secrets upload failed (scp exit $LASTEXITCODE). Aborting." -ForegroundColor Red
        if (Test-Path ".\deploy.tar.gz") { Remove-Item -Force ".\deploy.tar.gz" }
        exit 1
    }
    Write-Host "  Server secrets uploaded (deploy.env)." -ForegroundColor Green
} else {
    Write-Host "  No deploy.env found - skipping server secrets (see deploy.env.example)." -ForegroundColor DarkYellow
}

# ─── Step 5: Extract and Restart ─────────────────────────────────
Write-Host "[5/5] Extracting on VM and restarting PM2... (You will be prompted for your password again)" -ForegroundColor Yellow
# Runs on the VM. `set -e` makes any failure propagate to ssh's exit code.
# The deploy.env merge is an additive upsert: only the keys present in
# deploy.env are replaced/added in .env.production.local; every other var
# already on the VM (DATABASE_URL, NEXTAUTH_*, ...) is left untouched.
$RemoteCommand = @"
set -e
echo "Backing up database (pre-deploy)..."
BK="${VmPath}/db-backups"
mkdir -p "`$BK"
TS="`$(date +%Y%m%d-%H%M%S)"
for DB in ${VmPath}/dev.db ${VmPath}/prisma/dev.db; do
  [ -f "`$DB" ] || continue
  DEST="`$BK/`$(basename "`$(dirname "`$DB")")-`$(basename "`$DB").`$TS.db"
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "`$DB" ".backup '`$DEST'" || cp "`$DB" "`$DEST"
  else
    cp "`$DB" "`$DEST"
  fi
  echo "  Backed up `$DB -> `$DEST"
done
ls -1t "`$BK"/*.db 2>/dev/null | tail -n +11 | xargs -r rm -f || true
mkdir -p ${VmPath}/public/uploads
tar -xzf /tmp/deploy.tar.gz -C ${VmPath}/
rm /tmp/deploy.tar.gz
if [ -f /tmp/deploy.env ]; then
  cd ${VmPath}
  touch .env.production.local
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' /tmp/deploy.env > /tmp/deploy.env.clean || true
  cut -d= -f1 /tmp/deploy.env.clean | while read -r k; do sed -i "/^`$k=/d" .env.production.local; done
  cat /tmp/deploy.env.clean >> .env.production.local
  rm -f /tmp/deploy.env /tmp/deploy.env.clean
  echo "  Merged server secrets into .env.production.local"
fi
pm2 restart portfolio || pm2 restart all
pm2 status
"@

ssh -i $SshKey "${VmUser}@${VmHost}" $RemoteCommand
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Remote extract/restart failed (ssh exit $LASTEXITCODE)." -ForegroundColor Red
    Write-Host "Re-run .\deploy.ps1 to retry (the local archive has been kept)." -ForegroundColor Yellow
    # Keep the local archive so a full re-run isn't needed.
    exit 1
}

# Clean up local archive
if (Test-Path ".\deploy.tar.gz") { Remove-Item -Force ".\deploy.tar.gz" }

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
