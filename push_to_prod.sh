#!/bin/bash
# ============================================================
# SPHERA — Push Local → Production
# Usage: bash push_to_prod.sh
# ============================================================

set -e

SERVER="root@203.161.52.21"
REMOTE_DIR="/opt/sphera"
LOCAL_DIR="/home/kali/.gemini/antigravity/scratch/sphera/"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
section() { echo -e "\n${GREEN}══════════════════════════════════${NC}"; echo -e "${GREEN}  $1${NC}"; echo -e "${GREEN}══════════════════════════════════${NC}"; }

section "1. Syncing files to production"
rsync -avz --progress \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'sphera.db' \
  --exclude 'backend/.env' \
  --exclude 'backend/static/uploads' \
  --exclude 'node_modules' \
  --exclude 'lumora' \
  "${LOCAL_DIR}" "${SERVER}:${REMOTE_DIR}/"
info "Files synced to ${SERVER}:${REMOTE_DIR}"

section "2. Ensuring /opt/sphera exists on server"
ssh "${SERVER}" "mkdir -p ${REMOTE_DIR}"

section "3. Rebuilding & restarting Docker services"
ssh "${SERVER}" "
  cd ${REMOTE_DIR} && \
  docker compose -f docker-compose.prod.yml pull 2>/dev/null || true && \
  docker compose -f docker-compose.prod.yml up --build -d && \
  docker compose -f docker-compose.prod.yml ps
"
info "Docker services restarted"

section "4. Reloading Nginx"
ssh "${SERVER}" "nginx -t && systemctl reload nginx"
info "Nginx reloaded"

section "✅ Deployment Complete!"
echo ""
echo -e "  ${GREEN}SPHERA is live at:${NC}"
echo -e "  ${YELLOW}https://sphera.expediteconsults.com${NC}"
echo ""
echo -e "  ${GREEN}Live logs:${NC}"
echo "  ssh ${SERVER} \"docker compose -f ${REMOTE_DIR}/docker-compose.prod.yml logs -f\""
echo ""
