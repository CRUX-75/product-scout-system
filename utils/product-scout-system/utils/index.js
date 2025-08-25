// index.js (en la raíz)
require('dotenv').config?.();
const http = require('http');
const TikTokScraper = require('./custom-scripts/tiktok-scraper');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.url === '/tiktok') {
      const scraper = new TikTokScraper({ mode: process.env.SCRAPER_MODE || 'real' });
      await scraper.init();
      const products = await scraper.getTrendingProducts();
      await scraper.close();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ products }, null, 2));
    }

    // Default
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('product-scout-system running');
  } catch (err) {
    console.error('❌ Error en /tiktok:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server listening on http://${HOST}:${PORT}`);
});
