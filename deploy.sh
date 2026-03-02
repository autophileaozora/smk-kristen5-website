#!/bin/bash
# ============================================================
# Script Deploy ke VPS Exabyte - SMK Kristen 5 Klaten
# Jalankan dari root folder project: bash deploy.sh
# ============================================================

VPS_IP="GANTI_DENGAN_IP_VPS"         # contoh: 103.123.45.67
VPS_USER="root"
REMOTE_DIR="/var/www/smkkrisma"

echo "======================================"
echo " Deploy SMK Kristen 5 - VPS Exabyte"
echo "======================================"

# --- BUILD FRONTEND ---
echo ""
echo "[1/3] Build frontend..."
cd frontend

# Pastikan .env sudah pakai URL production
# VITE_API_URL=https://api.smkkrisma.sch.id

npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Build frontend gagal!"
  exit 1
fi
echo "Build frontend selesai."
cd ..

# --- UPLOAD FRONTEND ---
echo ""
echo "[2/3] Upload frontend ke VPS..."
scp -r frontend/dist/* $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/
echo "Upload frontend selesai."

# --- UPLOAD BACKEND ---
echo ""
echo "[3/3] Upload backend ke VPS..."
rsync -avz --exclude='node_modules' --exclude='.env' --exclude='logs' \
  backend/ $VPS_USER@$VPS_IP:$REMOTE_DIR/backend/

# Install dependencies & restart PM2 di VPS
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
  cd /var/www/smkkrisma/backend
  npm install --production
  pm2 restart smkkrisma-backend || pm2 start ecosystem.config.cjs --env production
  pm2 save
ENDSSH

echo ""
echo "======================================"
echo " Deploy selesai!"
echo " Frontend : https://smkkrisma.sch.id"
echo " Backend  : https://api.smkkrisma.sch.id"
echo "======================================"
