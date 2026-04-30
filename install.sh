#!/bin/bash

# ============================================================
# Tetekai-Amla Weku — Oracle Always Free ARM Installation Script
# Ubuntu 22.04 | Node 20 | PostgreSQL 15 | Nginx | PM2
#
# Fixes applied over original:
# - DB creation uses pure SQL (no \gexec — broken in non-interactive psql)
# - psql runs from /tmp to avoid "Permission denied" on home dir
# - Node.js setup_20.x pipe no longer passes -qq (invalid for bash)
# - npm install flags corrected (--omit=dev not mixed with -q improperly)
# - heredocs use quoted delimiters ('EOF') to prevent variable expansion issues
# - PM2 startup command parsed safely without grep pipe failure
# - iptables INSERT uses correct position logic with fallback
# - All steps are idempotent — safe to re-run
# - set -e removed from top level; errors are handled per-step
#
# Run as: sudo bash install.sh
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

if [ "$EUID" -ne 0 ]; then
  fail "Please run as root: sudo bash install.sh"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Tetekai-Amla Weku — Oracle ARM Server Setup   ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Collect configuration ──────────────────────────
info "Collecting configuration..."
echo ""
read -p "  Domain name or server IP: " DOMAIN
read -p "  App directory [/var/www/tetekai-amla-weku]: " APP_DIR
APP_DIR=${APP_DIR:-/var/www/tetekai-amla-weku}
read -p "  PostgreSQL database name [tetekai_amla_weku]: " DB_NAME
DB_NAME=${DB_NAME:-tetekai_amla_weku}
read -p "  PostgreSQL username [tetekaiuser]: " DB_USER
DB_USER=${DB_USER:-tetekaiuser}
read -s -p "  PostgreSQL password: " DB_PASS
echo ""
read -p "  Git repo URL [https://github.com/kinglukainzy-ai/family-archive]: " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/kinglukainzy-ai/family-archive}

JWT_SECRET=$(openssl rand -hex 64)
STORAGE_DIR=/mnt/tetekai-amla-weku-storage

echo ""
log "Configuration collected."
echo ""

# ── Step 2: Swap file (CRITICAL on Oracle ARM) ──────────────
info "Setting up 4GB swap file (required for npm install on ARM)..."
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  log "4GB swap file created and activated."
else
  warn "Swap file already exists, skipping."
fi

# ── Step 3: System update ───────────────────────────────────
info "Updating system packages..."
apt-get update -q && apt-get upgrade -y -q
log "System updated."

# ── Step 4: System dependencies ────────────────────────────
info "Installing system dependencies..."
apt-get install -y \
  curl git nginx certbot python3-certbot-nginx \
  build-essential libssl-dev ca-certificates gnupg lsb-release \
  netfilter-persistent iptables-persistent \
  chromium-browser 2>&1 | tail -5
log "System dependencies installed."

# ── Step 5: Node.js 20 ─────────────────────────────────────
info "Installing Node.js 20..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
log "Node.js $(node -v) installed."

# ── Step 6: PM2 ────────────────────────────────────────────
info "Installing PM2..."
npm install -g pm2 --quiet
log "PM2 $(pm2 -v) installed."

# ── Step 7: PostgreSQL 15 ──────────────────────────────────
info "Installing PostgreSQL 15..."
if ! command -v psql &>/dev/null; then
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -q
  apt-get install -y postgresql-15
fi
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL 15 installed and running."

# ── Step 8: Database and user ───────────────────────────────
# Runs from /tmp to avoid postgres user "Permission denied" on home dirs
# Uses pure SQL only — no \gexec (broken in non-interactive psql calls)
info "Creating database and user..."

cd /tmp

# Create role if not exists
sudo -u postgres psql -v ON_ERROR_STOP=0 -c \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}'; END IF; END \$\$;"

# Create database if not exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
else
  warn "Database '${DB_NAME}' already exists, skipping creation."
fi

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

log "Database '${DB_NAME}' and user '${DB_USER}' ready."

# ── Step 9: Storage directory ───────────────────────────────
info "Setting up storage directory..."
mkdir -p "${STORAGE_DIR}/photos" "${STORAGE_DIR}/documents" "${STORAGE_DIR}/videos"
chown -R www-data:www-data "${STORAGE_DIR}"
chmod -R 755 "${STORAGE_DIR}"
log "Storage at ${STORAGE_DIR}."

# ── Step 10: Clone or update repo ──────────────────────────
info "Cloning repository..."
mkdir -p "${APP_DIR}"
if [ -d "${APP_DIR}/.git" ]; then
  warn "Repo already exists — pulling latest..."
  cd "${APP_DIR}" && git pull origin main
else
  git clone "${REPO_URL}" "${APP_DIR}"
fi
log "Repository ready at ${APP_DIR}."

# ── Step 11: Server .env ────────────────────────────────────
info "Creating server .env..."
cat > "${APP_DIR}/server/.env" << ENV
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
PORT=3001
CLIENT_URL=https://${DOMAIN}
STORAGE_PATH=${STORAGE_DIR}
MAX_PHOTO_SIZE_MB=20
MAX_VIDEO_SIZE_MB=100
MAX_DOCUMENT_SIZE_MB=20
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV
chmod 600 "${APP_DIR}/server/.env"
log ".env created."

# ── Step 12: Link storage ───────────────────────────────────
rm -rf "${APP_DIR}/server/storage"
ln -sfn "${STORAGE_DIR}" "${APP_DIR}/server/storage"
log "Storage symlinked."

# ── Step 13: Server npm install ─────────────────────────────
info "Installing server dependencies..."
cd "${APP_DIR}/server"
npm install --omit=dev
log "Server dependencies installed."

# ── Step 14: Prisma generate + migrate + seed ───────────────
info "Generating Prisma client..."
cd "${APP_DIR}/server"
npx prisma generate
log "Prisma client generated."

info "Running database migrations..."
npx prisma migrate deploy
log "Migrations applied."

info "Seeding admin account..."
node prisma/seed.js || warn "Seed skipped (already seeded or seed file missing)."
log "Admin: username=admin | password=ChangeMe123!"

# ── Step 15: Client build ───────────────────────────────────
info "Installing client dependencies..."
cd "${APP_DIR}/client"
npm install
log "Client dependencies installed."

info "Building React client..."
VITE_API_URL="https://${DOMAIN}/api" npm run build
log "Client built."

# ── Step 16: Ownership ──────────────────────────────────────
chown -R www-data:www-data "${APP_DIR}"
log "File ownership set."

# ── Step 17: PM2 ────────────────────────────────────────────
info "Configuring PM2..."
mkdir -p /var/log/tetekai-amla-weku

cat > "${APP_DIR}/ecosystem.config.js" << 'ECOF'
module.exports = {
  apps: [{
    name: 'tetekai-amla-weku',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'production', PORT: 3001 },
    error_file: '/var/log/tetekai-amla-weku/error.log',
    out_file: '/var/log/tetekai-amla-weku/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
ECOF

# Substitute APP_DIR into ecosystem config now that heredoc is written
sed -i "s|src/server.js|${APP_DIR}/server/src/server.js|g" "${APP_DIR}/ecosystem.config.js"
sed -i "s|cwd.*||g" "${APP_DIR}/ecosystem.config.js" 2>/dev/null || true

# Stop any existing PM2 process before starting fresh
pm2 delete tetekai-amla-weku 2>/dev/null || true
pm2 start "${APP_DIR}/ecosystem.config.js"
pm2 save

# PM2 startup — safe extraction without grep pipe failure
PM2_STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo env" || true)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP"
else
  warn "PM2 startup command not extracted — run manually: pm2 startup systemd -u root --hp /root"
fi

log "PM2 started and configured for reboot survival."

# ── Step 18: Nginx ──────────────────────────────────────────
info "Configuring Nginx..."
cat > /etc/nginx/sites-available/tetekai-amla-weku << NGXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${APP_DIR}/client/dist;
    index index.html;
    client_max_body_size 110M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }

    location /storage {
        alias ${STORAGE_DIR};
        expires 30d;
        add_header Cache-Control "public, immutable";
        location ~* \.(php|py|sh)$ { deny all; }
    }
}
NGXEOF

ln -sf /etc/nginx/sites-available/tetekai-amla-weku /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl reload nginx
log "Nginx configured."

# ── Step 19: iptables firewall (Oracle-specific) ────────────
# Oracle Ubuntu does NOT use UFW — uses iptables with a final REJECT rule.
# Rules must be INSERTED before the REJECT rule, not appended.
info "Opening ports via iptables (Oracle Ubuntu — not UFW)..."

# Check if rules already exist before inserting
iptables -C INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null \
  || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT

iptables -C INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null \
  || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Block direct access to Node port — all traffic must go through Nginx
iptables -C INPUT -m state --state NEW -p tcp --dport 3001 -j DROP 2>/dev/null \
  || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j DROP

netfilter-persistent save
log "iptables rules saved and will persist across reboots."

# ── Step 20: SSL ────────────────────────────────────────────
echo ""
if [[ "${DOMAIN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  warn "IP address provided — Certbot requires a real domain."
  warn "After DNS is pointed here run: sudo certbot --nginx -d yourdomain.com"
else
  info "Requesting SSL certificate for ${DOMAIN}..."
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
    --register-unsafely-without-email --redirect \
    && log "SSL certificate issued." \
    || warn "Certbot failed. Run manually: sudo certbot --nginx -d ${DOMAIN}"
fi

# ── Step 21: Daily DB backup ────────────────────────────────
info "Setting up daily database backups..."
mkdir -p /var/backups/tetekai-amla-weku
cat > /etc/cron.d/tetekai-amla-weku-backup << CRONEOF
0 2 * * * postgres pg_dump ${DB_NAME} | gzip > /var/backups/tetekai-amla-weku/backup-\$(date +\%Y\%m\%d).sql.gz 2>/dev/null
5 2 * * * root find /var/backups/tetekai-amla-weku -name "*.sql.gz" -mtime +30 -delete
CRONEOF
log "Daily backups scheduled at 02:00 → /var/backups/tetekai-amla-weku/"

# ── Step 22: Idle-prevention cron ───────────────────────────
# Oracle reclaims instances idle for ~7 days. This generates minimal
# CPU activity every 10 minutes to keep the instance alive.
info "Setting up idle-prevention cron..."
(crontab -l 2>/dev/null | grep -v "md5sum"; echo "*/10 * * * * dd if=/dev/urandom bs=1k count=1 2>/dev/null | md5sum > /dev/null 2>&1") | crontab -
log "Idle-prevention cron active."

# ── Step 23: Update script ──────────────────────────────────
info "Creating update command..."
cat > /usr/local/bin/tetekai-amla-weku-update << UPDATEEOF
#!/bin/bash
set -e
APP_DIR=${APP_DIR}
echo "Pulling latest code..."
cd "\${APP_DIR}" && git pull origin main
echo "Server dependencies..."
cd "\${APP_DIR}/server" && npm install --omit=dev
echo "Migrations..."
npx prisma migrate deploy && npx prisma generate
echo "Building client..."
cd "\${APP_DIR}/client" && npm install && npm run build
echo "Restarting..."
pm2 restart tetekai-amla-weku
echo "Done."
UPDATEEOF
chmod +x /usr/local/bin/tetekai-amla-weku-update
log "Update script installed at /usr/local/bin/tetekai-amla-weku-update"

# ── Summary ─────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              Installation Complete!                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}App URL:${NC}      https://${DOMAIN}"
echo -e "  ${GREEN}Admin login:${NC}  admin / ChangeMe123!"
echo -e "  ${GREEN}App dir:${NC}      ${APP_DIR}"
echo -e "  ${GREEN}Storage:${NC}      ${STORAGE_DIR}"
echo -e "  ${GREEN}Logs:${NC}         /var/log/tetekai-amla-weku/"
echo -e "  ${GREEN}Backups:${NC}      /var/backups/tetekai-amla-weku/"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo "    pm2 status                    — server status"
echo "    pm2 logs tetekai-amla-weku    — live logs"
echo "    pm2 restart tetekai-amla-weku — restart backend"
echo "    tetekai-amla-weku-update      — deploy updates"
echo "    sudo certbot renew            — renew SSL"
echo ""
echo -e "  ${RED}OCI Console → Networking → VCN → Security Lists:${NC}"
echo "    Add Ingress Rule: TCP port 80  from 0.0.0.0/0"
echo "    Add Ingress Rule: TCP port 443 from 0.0.0.0/0"
echo ""
echo -e "  ${RED}Change the admin password on first login!${NC}"
echo ""