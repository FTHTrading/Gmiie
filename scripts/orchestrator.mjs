#!/usr/bin/env node

/**
 * XXXIII.io Orchestrator
 * =======================
 * Launches all services for the 24/7 AI intelligence pipeline:
 *
 *   1. Queue Worker  — BullMQ job processing (classify, score, draft, SEO, publish)
 *   2. Ingestion API — Python FastAPI HTTP service for content ingestion
 *   3. GMIIE App     — Next.js dashboard (optional, for dev)
 *
 * Usage:
 *   node scripts/orchestrator.mjs                  # All services
 *   node scripts/orchestrator.mjs --no-web          # Pipeline only (no Next.js)
 *   node scripts/orchestrator.mjs --services queue  # Only queue worker
 *
 * Prerequisites:
 *   - PostgreSQL running on port 5433
 *   - Redis running on port 6379
 *   - Python 3.11+ with ingestion deps installed
 *   - pnpm install completed
 *   - .env file configured with OPENAI_API_KEY
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Configuration ────────────────────────────────────────────

const COLORS = {
  queue: '\x1b[36m',    // cyan
  ingest: '\x1b[33m',   // yellow
  gmiie: '\x1b[35m',    // magenta
  hub: '\x1b[32m',      // green
  reset: '\x1b[0m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const args = process.argv.slice(2);
const noWeb = args.includes('--no-web');
const servicesFilter = args.includes('--services')
  ? args[args.indexOf('--services') + 1]?.split(',')
  : null;

function shouldRun(name) {
  if (servicesFilter) return servicesFilter.includes(name);
  return true;
}

// ── Logging ──────────────────────────────────────────────────

function log(service, color, message) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`${COLORS.dim}${ts}${COLORS.reset} ${color}[${service}]${COLORS.reset} ${message}`);
}

function logError(service, color, message) {
  const ts = new Date().toISOString().slice(11, 19);
  console.error(`${COLORS.dim}${ts}${COLORS.reset} ${color}[${service}]${COLORS.reset} ${COLORS.red}${message}${COLORS.reset}`);
}

// ── Preflight Checks ─────────────────────────────────────────

async function preflight() {
  console.log(`\n${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}  XXXIII.io — System Orchestrator${COLORS.reset}`);
  console.log(`${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  const checks = [];

  // Check .env
  if (!existsSync(resolve(ROOT, '.env'))) {
    logError('PREFLIGHT', COLORS.red, 'Missing .env file. Copy .env.example → .env and configure.');
    process.exit(1);
  }
  checks.push('✓ .env file found');

  // Check node_modules
  if (!existsSync(resolve(ROOT, 'node_modules'))) {
    logError('PREFLIGHT', COLORS.red, 'node_modules missing. Run: pnpm install');
    process.exit(1);
  }
  checks.push('✓ node_modules installed');

  // Check Prisma client
  const prismaClient = resolve(ROOT, 'packages/db/node_modules/.prisma/client');
  if (!existsSync(prismaClient)) {
    log('PREFLIGHT', COLORS.dim, 'Prisma client not generated. Generating...');
    await runCommand('pnpm', ['db:generate'], ROOT, 'PREFLIGHT', COLORS.dim, true);
  }
  checks.push('✓ Prisma client ready');

  for (const check of checks) {
    console.log(`  ${check}`);
  }
  console.log('');
}

// ── Process Management ───────────────────────────────────────

const processes = new Map();

function spawnService(name, command, args, cwd, color, env = {}) {
  const fullEnv = {
    ...process.env,
    FORCE_COLOR: '1',
    ...env,
  };

  log(name, color, `Starting: ${command} ${args.join(' ')}`);

  const proc = spawn(command, args, {
    cwd,
    env: fullEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) log(name, color, line.trim());
    }
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) logError(name, color, line.trim());
    }
  });

  proc.on('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      logError(name, color, `Exited with code ${code}`);
      // Auto-restart after 5 seconds
      if (!shuttingDown) {
        log(name, color, 'Restarting in 5 seconds...');
        setTimeout(() => {
          if (!shuttingDown) {
            spawnService(name, command, args, cwd, color, env);
          }
        }, 5000);
      }
    } else if (signal) {
      log(name, color, `Killed by signal ${signal}`);
    }
  });

  processes.set(name, proc);
  return proc;
}

function runCommand(command, args, cwd, name, color, wait = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: 'pipe', shell: true });
    let output = '';
    proc.stdout.on('data', (d) => { output += d; });
    proc.stderr.on('data', (d) => { output += d; });
    proc.on('exit', (code) => {
      if (code !== 0) {
        logError(name, color, output.trim());
        reject(new Error(`${command} failed with code ${code}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}

// ── Service Launchers ────────────────────────────────────────

function startQueueWorker() {
  if (!shouldRun('queue')) return;
  spawnService(
    'QUEUE',
    'npx',
    ['tsx', 'src/worker.ts'],
    resolve(ROOT, 'services/queue'),
    COLORS.queue,
    { DOTENV_CONFIG_PATH: resolve(ROOT, '.env') },
  );
}

function startIngestionService() {
  if (!shouldRun('ingest')) return;
  const ingestionDir = resolve(ROOT, 'services/ingestion');

  // Use python/uvicorn to run the FastAPI server
  spawnService(
    'INGEST',
    'python',
    ['-m', 'uvicorn', 'src.server:app', '--host', '0.0.0.0', '--port', '8100', '--reload'],
    ingestionDir,
    COLORS.ingest,
  );
}

function startGMIIE() {
  if (noWeb || !shouldRun('gmiie')) return;
  spawnService(
    'GMIIE',
    'pnpm',
    ['dev'],
    resolve(ROOT, 'apps/gmiie'),
    COLORS.gmiie,
  );
}

// ── Graceful Shutdown ────────────────────────────────────────

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n${COLORS.bold}Shutting down all services...${COLORS.reset}`);

  for (const [name, proc] of processes) {
    log(name, COLORS.dim, 'Sending SIGTERM...');
    proc.kill('SIGTERM');
  }

  // Force kill after 10 seconds
  setTimeout(() => {
    for (const [name, proc] of processes) {
      if (!proc.killed) {
        logError(name, COLORS.red, 'Force killing...');
        proc.kill('SIGKILL');
      }
    }
    process.exit(0);
  }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Main ─────────────────────────────────────────────────────

async function main() {
  await preflight();

  console.log(`${COLORS.bold}Launching services:${COLORS.reset}`);
  if (shouldRun('queue')) console.log(`  → Queue Worker (BullMQ pipeline)`);
  if (shouldRun('ingest')) console.log(`  → Ingestion API (Python FastAPI :8100)`);
  if (!noWeb && shouldRun('gmiie')) console.log(`  → GMIIE Dashboard (Next.js :3001)`);
  console.log('');

  // Stagger startups to avoid resource contention
  startQueueWorker();
  await new Promise(r => setTimeout(r, 2000));

  startIngestionService();
  await new Promise(r => setTimeout(r, 2000));

  startGMIIE();

  console.log(`\n${COLORS.bold}${COLORS.queue}All services running. Press Ctrl+C to stop.${COLORS.reset}\n`);
}

main().catch((err) => {
  console.error(`${COLORS.red}Orchestrator failed:${COLORS.reset}`, err);
  process.exit(1);
});
