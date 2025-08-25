// custom-scripts/tiktok-scraper.js

// --- Carga robusta del helper (tolera distintas ubicaciones) ---
let launchBrowser;
try {
  ({ launchBrowser } = require('../utils/puppeteerClient'));     // ruta recomendada
  console.log('[SCRAPER] usando ../utils/puppeteerClient');
} catch (e1) {
  try {
    ({ launchBrowser } = require('./puppeteerClient'));          // fallback local (evita crash)
    console.log('[SCRAPER] usando ./puppeteerClient (fallback)');
  } catch (e2) {
    console.error('[SCRAPER] No se pudo cargar puppeteerClient desde ninguna ruta');
    throw e1;
  }
}

// --- Utilidades pequeñas ---
const NOW = () => new Date().toISOString().replace('T', ' ').replace('Z', '');
const log = (...args) => console.log(`[${NOW()}]`, ...args);

const DEFAULT_MAX_ITEMS = Number(process.env.SCRAPER_MAX_ITEMS || 5);
const DISCOVER_URL =
  process.env.TIKTOK_DISCOVER_URL || 'https://www.tiktok.com/discover';

const DEFAULT_USER_AGENT =
  process.env.SCRAPER_UA ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Retry genérico para operaciones frágiles (navegación, evaluate, etc.)
async function withRetries(fn, { attempts = 2, delayMs = 800 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

class TikTokScraper {
  /**
   * Scraper TikTok en modo real con Puppeteer
   */
  constructor(opts = {}) {
    this.mode = opts.mode || process.env.SCRAPER_MODE || 'real'; // default = real
    this.maxItems = Number(opts.maxItems || DEFAULT_MAX_ITEMS);
    this.discoverUrl = opts.url || DISCOVER_URL;

    this.browser = null;
    this.page = null;
  }

  async init() {
    log('🚀 Inicializando TikTok Scraper...', { mode: this.mode });

    this.browser = await launchBrowser();
    this.page = await this.browser.newPage();

    // Ajustes recomendados para contenedores
    await this.page.setDefaultNavigationTimeout(60_000);
    await this.page.setUserAgent(DEFAULT_USER_AGENT);
    await this.page.setViewport({ width: 1366, height: 768 });

    // Bloquear recursos pesados para acelerar
    await this.page.setRequestInterception(true);
    this.page.on('request', req => {
      const type = req.resourceType();
      if (type === 'image' || type === 'media' || type === 'font') {
        return req.abort();
      }
      req.continue();
    });

    log('✅ Scraper listo (modo REAL con Puppeteer)');
  }

  async getTrendingProducts() {
    log('🔍 Visitando Discover:', this.discoverUrl);

    await withRetries(
      () =>
        this.page.goto(this.discoverUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 60_000
        }),
      { attempts: 2, delayMs: 800 }
    );

    // Espera a que aparezcan algunos hashtags
    await this.page.waitForSelector('a[href*="/tag/"]', { timeout: 15_000 });

    // Extrae primeros N hashtags como placeholders de "productos"
    const items = await this.page.$$eval('a[href*="/tag/"]', (els, max) => {
      const seen = new Set();
      const out = [];
      for (const el of els) {
        if (out.length >= max) break;
        const text = (el.innerText || el.textContent || '').trim();
        if (!text) continue;
        if (seen.has(text)) continue;
        seen.add(text);

        out.push({
          name: text,
          price: null,
          dimensions: {},
          tiktok_data: {
            engagement_rate: null,
            viral_score: null,
            views: null,
            hashtags: [text]
          }
        });
      }
      return out;
    }, this.maxItems);

    log(`📊 Encontrados ${items.length} hashtags trending`);
    return items;
  }

  async close() {
    if (this.page) {
      try { await this.page.close(); } catch (_) {}
    }
    if (this.browser) {
      try { await this.browser.close(); } catch (_) {}
    }
    log('🔚 Cerrando scraper');
  }
}

module.exports = TikTokScraper;

// Ejecución directa local (node custom-scripts/tiktok-scraper.js)
if (require.main === module) {
  (async () => {
    const s = new TikTokScraper({ mode: process.env.SCRAPER_MODE || 'real' });
    try {
      await s.init();
      const r = await s.getTrendingProducts();
      console.log(JSON.stringify(r, null, 2));
    } finally {
      await s.close();
    }
  })().catch(err => {
    console.error('❌ Error en ejecución directa:', err);
    process.exit(1);
  });
}
