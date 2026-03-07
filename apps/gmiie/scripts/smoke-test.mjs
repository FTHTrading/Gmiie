#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// GMIIE — Route Smoke Test
// Boots the production build and hits every page family.
// Returns exit code 0 if all routes respond 200, 1 otherwise.
//
// Usage:
//   pnpm --filter @xxxiii/gmiie build
//   pnpm --filter @xxxiii/gmiie smoke
//
// In CI, run after build to gate PRs on route-level health.
// ═══════════════════════════════════════════════════════════════

import { execSync, spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = process.env.SMOKE_PORT ?? "3099";
const BASE = `http://localhost:${PORT}`;
const TIMEOUT_MS = 30_000;

// ─── Routes to check ───────────────────────────────────────
// Static pages + at least one dynamic slug per family.

const ROUTES = [
  // Static listing pages
  "/",
  "/intelligence",
  "/entities",
  "/topics",
  "/signals",
  "/regulators",
  "/reports",
  "/timeline",
];

// Dynamic slug pages — discovered from DB at build time.
// We pick known-seeded slugs; if they 404, that's still
// a useful signal (means seed data is missing).
const DYNAMIC_ROUTES = [
  "/intelligence/blackrock-buidl-fund-surpasses-2-billion-in-tokenized-assets",
  "/entities/jpmorgan-chase",
  "/topics/tokenized-funds",
];

async function waitForServer(url, maxWaitMs) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status < 500) return true;
    } catch {
      // server not ready yet
    }
    await sleep(500);
  }
  return false;
}

async function main() {
  console.log(`\n🔍 GMIIE Route Smoke Test\n`);
  console.log(`Starting production server on port ${PORT}...`);

  // Start next in production mode
  const server = spawn("npx", ["next", "start", "--port", PORT], {
    cwd: new URL("../", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: { ...process.env, PORT },
  });

  let serverOutput = "";
  server.stdout?.on("data", (d) => (serverOutput += d.toString()));
  server.stderr?.on("data", (d) => (serverOutput += d.toString()));

  // Wait for server to be ready
  const ready = await waitForServer(BASE, TIMEOUT_MS);
  if (!ready) {
    console.error(`❌ Server failed to start within ${TIMEOUT_MS / 1000}s`);
    console.error(serverOutput);
    server.kill("SIGTERM");
    process.exit(1);
  }

  console.log(`✅ Server ready\n`);

  const allRoutes = [...ROUTES, ...DYNAMIC_ROUTES];
  let passed = 0;
  let failed = 0;

  for (const route of allRoutes) {
    try {
      const res = await fetch(`${BASE}${route}`, {
        signal: AbortSignal.timeout(10_000),
      });
      const status = res.status;
      const ok = status >= 200 && status < 400;

      if (ok) {
        console.log(`  ✅ ${status} ${route}`);
        passed++;
      } else {
        console.log(`  ❌ ${status} ${route}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERR ${route} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed out of ${allRoutes.length} routes\n`);

  server.kill("SIGTERM");

  // Give server a moment to shut down
  await sleep(500);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
