#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# XXXIII.IO — Development Setup Script
# ═══════════════════════════════════════════════════════════
# Usage: ./infra/scripts/setup.sh
# ═══════════════════════════════════════════════════════════

set -euo pipefail

echo "═══════════════════════════════════════════════════════"
echo " XXXIII.IO — Development Environment Setup"
echo "═══════════════════════════════════════════════════════"
echo ""

# ─── Check Prerequisites ──────────────────────────────────
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm required. Run: npm i -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found. Infrastructure services won't start."; }

echo "✓ Node.js $(node -v)"
echo "✓ pnpm $(pnpm -v)"
echo ""

# ─── Environment File ─────────────────────────────────────
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "✓ .env created — edit with your API keys"
else
  echo "✓ .env exists"
fi
echo ""

# ─── Install Dependencies ─────────────────────────────────
echo "Installing dependencies..."
pnpm install
echo "✓ Dependencies installed"
echo ""

# ─── Start Infrastructure ─────────────────────────────────
if command -v docker >/dev/null 2>&1; then
  echo "Starting infrastructure services..."
  docker compose -f infra/docker/docker-compose.yml up -d postgres redis meilisearch
  echo "✓ PostgreSQL, Redis, Meilisearch started"
  echo ""

  # Wait for PostgreSQL
  echo "Waiting for PostgreSQL..."
  sleep 3
fi

# ─── Database Setup ───────────────────────────────────────
echo "Setting up database..."
pnpm --filter @xxxiii/db exec prisma generate
pnpm --filter @xxxiii/db exec prisma db push
echo "✓ Database schema applied"
echo ""

# ─── Build Packages ──────────────────────────────────────
echo "Building shared packages..."
pnpm run build --filter='./packages/*'
echo "✓ Packages built"
echo ""

# ─── Python Ingestion Service ─────────────────────────────
if command -v python3 >/dev/null 2>&1; then
  echo "Setting up Python ingestion service..."
  cd services/ingestion
  python3 -m venv .venv
  source .venv/bin/activate 2>/dev/null || .venv/Scripts/activate
  pip install -e . --quiet
  playwright install chromium
  cd ../..
  echo "✓ Ingestion service ready"
else
  echo "⚠️  Python 3 not found — ingestion service skipped"
fi
echo ""

# ─── Done ─────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo " ✓ Setup complete!"
echo ""
echo " Start development:"
echo "   pnpm dev           # All apps"
echo "   pnpm dev:hub       # Root site (localhost:3000)"
echo "   pnpm dev:gmiie     # Intelligence platform (localhost:3001)"
echo "   pnpm dev:lps       # LPS protocol (localhost:3002)"
echo "   pnpm dev:studio    # Admin studio (localhost:3003)"
echo ""
echo " Infrastructure:"
echo "   PostgreSQL   → localhost:5432"
echo "   Redis        → localhost:6379"
echo "   Meilisearch  → localhost:7700"
echo "   Adminer      → localhost:8080"
echo "═══════════════════════════════════════════════════════"
