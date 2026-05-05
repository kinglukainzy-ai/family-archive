#!/bin/bash

# ============================================================
# Tetekai-Amla Weku — Update Script
# Pulls latest code, applies DB migrations, rebuilds client.
#
# DATABASE SAFETY:
#   'prisma migrate deploy' only runs NEW forward migrations.
#   It will NEVER roll back, drop tables, or delete data.
#   Existing data is always preserved.
#
# Run as: sudo bash update.sh
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
  fail "Please run as root: sudo bash update.sh"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       Tetekai-Amla Weku — Updater                ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Detect APP_DIR ───────────────────────────────────────────
# Try to read from PM2 first
APP_DIR=""
if pm2 describe tetekai-amla-weku &>/dev/null; then
  APP_DIR=$(pm2 describe tetekai-amla-weku 2>/dev/null \
    | grep -i "exec cwd" | awk '{print $NF}' | head -1 || true)
  # PM2 cwd points to server dir — go up one level
  if [ -n "$APP_DIR" ] && [ "$(basename "$APP_DIR")" = "server" ]; then
    APP_DIR="$(dirname "$APP_DIR")"
  fi
fi

# Fallback: check common install location
if [ -z "$APP_DIR" ] || [ ! -d "$APP_DIR" ]; then
  if [ -d "/var/www/tetekai-amla-weku" ]; then
    APP_DIR="/var/www/tetekai-amla-weku"
  else
    read -p "  App directory [/var/www/tetekai-amla-weku]: " APP_DIR
    APP_DIR=${APP_DIR:-/var/www/tetekai-amla-weku}
  fi
fi

[ -d "$APP_DIR" ]            || fail "App directory not found: $APP_DIR"
[ -f "$APP_DIR/server/.env" ] || fail "Server .env not found at $APP_DIR/server/.env"

info "App directory: $APP_DIR"

# ── Read DOMAIN from server .env ─────────────────────────────
CLIENT_URL=$(grep '^CLIENT_URL=' "$APP_DIR/server/.env" | cut -d= -f2- | tr -d '"')
DOMAIN="${CLIENT_URL#https://}"
DOMAIN="${DOMAIN%/}"

[ -n "$DOMAIN" ] || fail "Could not determine CLIENT_URL from $APP_DIR/server/.env"
info "Domain: $DOMAIN"
echo ""

# ── Step 1: Sync latest code (hard reset — server always matches remote) ─
info "Pulling latest code..."
cd "$APP_DIR" || fail "Cannot cd to $APP_DIR"

# Allow root to access the repo even if owned by www-data
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already up to date — continuing to sync dependencies and rebuild."
else
  # Hard reset discards any local server edits so the pull is never blocked.
  # Config/secrets live in .env (not tracked), so no data is lost.
  git reset --hard origin/main || fail "git reset failed"
  log "Code updated to $(git rev-parse --short HEAD)."
fi

# ── Step 2: Server dependencies ──────────────────────────────
info "Installing server dependencies..."
cd "$APP_DIR/server" || fail "Cannot cd to $APP_DIR/server"
npm install --omit=dev || fail "npm install (server) failed"
log "Server dependencies ready."

# ── Step 3: Database migrations (SAFE — data is preserved) ───
info "Applying database migrations..."
# migrate deploy: runs only NEW migrations in order.
# Already-applied migrations are skipped automatically.
# No data is ever dropped or reset.
npx prisma migrate deploy || fail "Prisma migrate deploy failed"
log "Migrations applied."

info "Regenerating Prisma client..."
npx prisma generate || fail "Prisma generate failed"
log "Prisma client regenerated."

# ── Step 4: Rebuild React client ─────────────────────────────
info "Installing client dependencies..."
cd "$APP_DIR/client" || fail "Cannot cd to $APP_DIR/client"
npm install || fail "npm install (client) failed"
log "Client dependencies ready."

info "Building React client..."
VITE_API_URL="https://${DOMAIN}/api" npm run build || fail "Client build failed"
log "Client built."

# ── Step 5: Fix file ownership ───────────────────────────────
chown -R www-data:www-data "$APP_DIR"
log "File ownership corrected."

# ── Step 6: Restart backend ───────────────────────────────────
info "Restarting backend..."
pm2 restart tetekai-amla-weku || fail "PM2 restart failed"
pm2 save
log "Backend restarted."

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║             Update Complete! ✓                   ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}App:${NC}     https://${DOMAIN}"
echo -e "  ${GREEN}Status:${NC}  pm2 status"
echo -e "  ${GREEN}Logs:${NC}    pm2 logs tetekai-amla-weku"
echo ""
