// custom-scripts/tiktok-scraper.js

const { launchBrowser } = require('../utils/puppeteerClient');

class TikTokScraper {
  /**
   * Scraper TikTok en modo real con Puppeteer
   */
  constructor(opts = {}) {
    this.mode = opts.mode || process.env.SCRAPER_MODE || 'real'; // 🔥 default = real
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Inicializando TikTok Scraper...', { mode: this.mode });

    this.browser = await launchBrowser();
    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(60_000);

    console.log('✅ Scraper listo (modo REAL con Puppeteer)');
  }

  async getTrendingProducts() {
    console.log('🔍 Visitando TikTok Discover page...');

    // ⚠️ TikTok suele bloquear bots, aquí abrimos la sección Discover como ejemplo
    await this.page.goto('https://www.tiktok.com/discover', {
      waitUntil: 'domcontentloaded'
    });

    // 🔎 Sacamos títulos de tarjetas (placeholder de ejemplo)
    const products = await this.page.evaluate(() => {
      const items = [];
      document.querySelectorAll('a[href*="/tag/"]').forEach((el, idx) => {
        if (idx < 5) {
          items.push({
            name: el.innerText.trim() || `Trending ${idx + 1}`,
            price: null,
            dimensions: {},
            tiktok_data: {
              engagement_rate: null,
              viral_score: null,
              views: null,
              hashtags: [el.innerText.trim()]
            }
          });
        }
      });
      return items;
    });

    console.log(`📊 Encontrados ${products.length} hashtags trending`);
    return products;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🔚 Cerrando scraper');
  }
}

module.exports = TikTokScraper;

// Ejecución directa local (node custom-scripts/tiktok-scraper.js)
if (require.main === module) {
  (async () => {
    const s = new TikTokScraper({ mode: process.env.SCRAPER_MODE || 'real' });
    await s.init();
    const r = await s.getTrendingProducts();
    console.log(JSON.stringify(r, null, 2));
    await s.close();
  })().catch(console.error);
}
