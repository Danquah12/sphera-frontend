#!/bin/bash
# ============================================================
# Run this from YOUR LOCAL MACHINE (not the server)
# It uploads SPHERA code to your Namecheap VPS
# ============================================================

# ← CHANGE THIS to your actual server IP from Namecheap email
SERVER_IP="203.161.52.21"

APP_DIR="/opt/sphera"
LOCAL_DIR="/home/kali/.gemini/antigravity/scratch/sphera"

echo "📦 Uploading SPHERA to ${SERVER_IP}..."

# Create remote directory
ssh root@${SERVER_IP} "mkdir -p ${APP_DIR}"

# Upload all SPHERA files (excluding dev artifacts)
rsync -avz --progress \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='sphera.db' \
    --exclude='node_modules' \
    --exclude='.git' \
    ${LOCAL_DIR}/ root@${SERVER_IP}:${APP_DIR}/

# Upload .env separately (it has secrets)
echo "🔑 Uploading backend .env..."
scp ${LOCAL_DIR}/backend/.env root@${SERVER_IP}:${APP_DIR}/backend/.env

echo ""
echo "✅ Upload complete!"
echo ""
echo "Now SSH into your server and run the deploy script:"
echo "  ssh root@${SERVER_IP}"
echo "  bash /opt/sphera/deploy.sh"
