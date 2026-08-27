#!/bin/bash
# ============================================================
# SPHERA — Full Server Deploy Script
# Run this on a fresh Ubuntu 24.04 VPS as root
# Usage: bash deploy.sh
# ============================================================

set -e

DOMAIN="expediteconsults.com"
SPHERA_SUBDOMAIN="sphera.${DOMAIN}"
APP_DIR="/opt/sphera"
EMAIL="kasiedu@expediteconsults.com"   # Used for SSL cert notifications

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
section() { echo -e "\n${GREEN}══════════════════════════════════${NC}"; echo -e "${GREEN}  $1${NC}"; echo -e "${GREEN}══════════════════════════════════${NC}"; }

# ── 1. System updates ────────────────────────────────────────
section "1. Updating system packages"
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw nginx certbot python3-certbot-nginx \
    python3-pip python3-venv software-properties-common apt-transport-https ca-certificates gnupg
info "System packages ready"

# ── 2. Install Docker ────────────────────────────────────────
section "2. Installing Docker"
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker && systemctl start docker
    info "Docker installed"
else
    info "Docker already installed"
fi

# Install Docker Compose v2
if ! command -v docker &>/dev/null || ! docker compose version &>/dev/null; then
    apt-get install -y docker-compose-plugin
fi
info "Docker Compose ready"

# ── 3. Firewall ──────────────────────────────────────────────
section "3. Configuring firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
info "Firewall configured (SSH + HTTP + HTTPS)"

# ── 4. Create app directory ──────────────────────────────────
section "4. Setting up app directory"
mkdir -p ${APP_DIR}/{backend,frontend,nginx/conf.d,ssl}
info "App directory created at ${APP_DIR}"

# ── 5. Copy SPHERA code ──────────────────────────────────────
section "5. SPHERA code"
echo ""
warn "ACTION REQUIRED: Upload your SPHERA code from your local machine."
echo ""
echo "  Open a NEW terminal on your local machine and run:"
echo ""
echo -e "  ${YELLOW}rsync -avz --progress \\"
echo "    /home/kali/.gemini/antigravity/scratch/sphera/ \\"
echo -e "    root@SERVER_IP:${APP_DIR}/${NC}"
echo ""
echo "  Replace SERVER_IP with your actual server IP."
echo ""
read -p "  Press ENTER once the files are uploaded..."
info "Code upload acknowledged"

# ── 6. Create production .env ────────────────────────────────
section "6. Production environment config"
if [ ! -f "${APP_DIR}/backend/.env" ]; then
    warn "No .env found. Creating template..."
    cat > ${APP_DIR}/backend/.env <<EOF
# ── Database ────────────────────────────────
DATABASE_URL=postgresql+asyncpg://sphera:CHANGE_ME_DB_PASS@db:5432/spheradb
POSTGRES_DB=spheradb
POSTGRES_USER=sphera
POSTGRES_PASSWORD=CHANGE_ME_DB_PASS

# ── Security ─────────────────────────────────
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(48))")
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# ── App ──────────────────────────────────────
APP_BASE_URL=https://${SPHERA_SUBDOMAIN}
ALLOWED_ORIGINS=https://${SPHERA_SUBDOMAIN}
ENVIRONMENT=production
SEED_DB=0

# ── Email (SMTP) ─────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@${DOMAIN}

# ── OpenAI ───────────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_FEATURES_ENABLED=true

# ── Uploads ──────────────────────────────────
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_MB=50
EOF
    warn "Edit ${APP_DIR}/backend/.env and fill in OPENAI_API_KEY and SMTP_PASSWORD"
    warn "Then re-run this script or run: docker compose -f ${APP_DIR}/docker-compose.prod.yml up -d"
fi

# ── 7. Production docker-compose ─────────────────────────────
section "7. Creating production docker-compose"
cat > ${APP_DIR}/docker-compose.prod.yml <<'EOF'
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    restart: always
    env_file: ./backend/.env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [spheranet]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    restart: always
    env_file: ./backend/.env
    volumes:
      - uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
    networks: [spheranet]
    expose: ["8000"]
    command: >
      sh -c "python3 -m alembic upgrade head &&
             python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2"

  frontend:
    image: nginx:alpine
    restart: always
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx/frontend.conf:/etc/nginx/conf.d/default.conf:ro
    networks: [spheranet]
    expose: ["80"]

volumes:
  pgdata:
  uploads:

networks:
  spheranet:
    driver: bridge
EOF
info "Production docker-compose created"

# ── 8. Frontend nginx micro-config ───────────────────────────
cat > ${APP_DIR}/nginx/frontend.conf <<'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|png|jpg|gif|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# ── 9. Main Nginx reverse proxy config ───────────────────────
section "8. Configuring Nginx reverse proxy"
cat > /etc/nginx/sites-available/sphera <<EOF
# ── HTTP → HTTPS redirect ─────────────────────
server {
    listen 80;
    server_name ${SPHERA_SUBDOMAIN};
    return 301 https://\$host\$request_uri;
}

# ── SPHERA HTTPS ──────────────────────────────
server {
    listen 443 ssl http2;
    server_name ${SPHERA_SUBDOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${SPHERA_SUBDOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SPHERA_SUBDOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    add_header Strict-Transport-Security "max-age=63072000" always;

    client_max_body_size 50M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    # Static uploads
    location /static/ {
        proxy_pass http://localhost:8000;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sphera /etc/nginx/sites-enabled/sphera
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
info "Nginx configured"

# ── 10. SSL Certificate ──────────────────────────────────────
section "9. Obtaining SSL certificate"
warn "Make sure ${SPHERA_SUBDOMAIN} A record in GoDaddy → points to this server IP first!"
warn "DNS propagation takes 5–15 minutes after adding the A record."
echo ""
read -p "Have you added the A record in GoDaddy DNS? (y/N): " DNS_READY
if [[ "$DNS_READY" =~ ^[Yy]$ ]]; then
    certbot --nginx -d ${SPHERA_SUBDOMAIN} --non-interactive --agree-tos -m ${EMAIL} || \
        warn "SSL cert failed — DNS may not have propagated yet. Run: certbot --nginx -d ${SPHERA_SUBDOMAIN}"
else
    warn "Skipping SSL for now. Run this after DNS is set:"
    echo "  certbot --nginx -d ${SPHERA_SUBDOMAIN} -m ${EMAIL} --agree-tos"
fi

# ── 11. Launch SPHERA ────────────────────────────────────────
section "10. Launching SPHERA"
cd ${APP_DIR}
docker compose -f docker-compose.prod.yml pull 2>/dev/null || true
SEED_DB=1 docker compose -f docker-compose.prod.yml up --build -d
info "SPHERA containers starting..."

# ── 12. Final status ─────────────────────────────────────────
section "✅ Deployment Complete!"
echo ""
echo -e "  ${GREEN}SPHERA is live at:${NC}"
echo -e "  ${YELLOW}https://${SPHERA_SUBDOMAIN}${NC}"
echo ""
echo -e "  ${GREEN}API docs:${NC} https://${SPHERA_SUBDOMAIN}/api/v1/docs"
echo ""
echo -e "  ${GREEN}Useful commands:${NC}"
echo "  docker compose -f ${APP_DIR}/docker-compose.prod.yml logs -f    # live logs"
echo "  docker compose -f ${APP_DIR}/docker-compose.prod.yml ps         # status"
echo "  docker compose -f ${APP_DIR}/docker-compose.prod.yml restart    # restart"
echo ""
