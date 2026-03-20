/**
 * Post-build prerendering script
 *
 * Spins up a local static server for the Vite `dist/` output,
 * visits each route with Puppeteer, captures the fully-rendered HTML
 * (including React-hydrated DOM), and writes it back to disk.
 *
 * Crawlers that skip JS execution will now see real content,
 * structured data, and semantic markup instead of an empty <div id="root">.
 *
 * Usage:  node scripts/prerender.mjs
 * Called automatically by `npm run build` (see package.json).
 */

import { createServer } from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;

// Routes to prerender — add new routes here as the site grows
const ROUTES = ['/', '/showcase'];

/* ── tiny static file server ────────────────────────────── */
function startServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js':   'application/javascript',
      '.css':  'text/css',
      '.json': 'application/json',
      '.svg':  'image/svg+xml',
      '.png':  'image/png',
      '.jpg':  'image/jpeg',
      '.woff': 'font/woff',
      '.woff2':'font/woff2',
    };

    const server = createServer(async (req, res) => {
      let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);

      try {
        const data = await readFile(filePath);
        const ext = '.' + filePath.split('.').pop();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        // SPA fallback — serve index.html for any unknown path
        const fallback = await readFile(join(DIST, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fallback);
      }
    });

    server.listen(PORT, () => resolve(server));
  });
}

/* ── prerender each route ───────────────────────────────── */
async function prerender() {
  console.log('\n🔍  Prerendering started…\n');

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    // Use system Chromium in Docker (PUPPETEER_EXECUTABLE_PATH), bundled locally
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    }),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();

    // Skip loading heavy assets that aren't needed for HTML capture
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'font', 'media'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const url = `http://localhost:${PORT}${route}`;
    console.log(`  → Rendering ${route}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait an extra moment for React hydration + GSAP init
    await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0, { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture the full rendered HTML
    const html = await page.content();

    // Determine output path: / → dist/index.html, /showcase → dist/showcase/index.html
    let outPath;
    if (route === '/') {
      outPath = join(DIST, 'index.html');
    } else {
      const dir = join(DIST, route.slice(1));
      await mkdir(dir, { recursive: true });
      outPath = join(dir, 'index.html');
    }

    await writeFile(outPath, html, 'utf-8');
    console.log(`    ✓ Saved ${outPath.replace(DIST, 'dist')}`);

    await page.close();
  }

  await browser.close();
  server.close();

  console.log(`\n✅  Prerendered ${ROUTES.length} routes successfully.\n`);
}

prerender().catch((err) => {
  console.error('❌  Prerender failed:', err.message);
  // Don't fail the build — prerendering is an enhancement, not a blocker
  process.exit(0);
});
