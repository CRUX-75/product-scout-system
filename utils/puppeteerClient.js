// utils/puppeteerClient.js
const isProd = process.env.NODE_ENV === 'production';

function requirePuppeteer() {
  try { return require('puppeteer'); }
  catch { return require('puppeteer-core'); }
}

async function launchBrowser(extraArgs = []) {
  const puppeteer = requirePuppeteer();

  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);

  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process',
    ...extraArgs,
  ];

  let lastErr;
  for (const path of candidates) {
    try {
      console.log('[PUPPETEER] Trying executable:', path);
      const browser = await puppeteer.launch({ headless: 'new', args, executablePath: path });
      console.log('[PUPPETEER] Launch OK with:', path);
      return browser;
    } catch (e) {
      console.error('[PUPPETEER] Failed with', path, e.message);
      lastErr = e;
    }
  }

  if (!isProd) {
    console.log('[PUPPETEER] Local fallback: using bundled Chromium');
    return puppeteer.launch({ headless: 'new', args });
  }

  throw lastErr || new Error('Chromium executable not found');
}

module.exports = { launchBrowser };
