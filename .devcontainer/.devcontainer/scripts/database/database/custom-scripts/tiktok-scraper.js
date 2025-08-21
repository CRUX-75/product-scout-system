const puppeteer = require('puppeteer');

/**
 * TikTok Hashtag Scraper
 * Scrapes trending products from TikTok hashtags
 */

class TikTokScraper {
    constructor(options = {}) {
        this.headless = options.headless !== false;
        this.timeout = options.timeout || 30000;
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }

    async scrapeHashtag(hashtag) {
        let browser = null;
        
        try {
            browser = await puppeteer.launch({
                headless: this.headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            await page.setUserAgent(this.userAgent);
            
            // Navigate to hashtag page
            const url = `https://www.tiktok.com/tag/${hashtag.replace('#', '')}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });

            // Wait for content to load
            await page.waitForTimeout(3000);

            // Extract product mentions from video descriptions
            const products = await page.evaluate(() => {
                const videoElements = document.querySelectorAll('[data-e2e="challenge-item"]');
                const extractedProducts = [];

                videoElements.forEach((element, index) => {
                    if (index >= 20) return; // Limit to first 20 videos

                    const descriptionElement = element.querySelector('[data-e2e="browse-video-desc"]');
                    if (!descriptionElement) return;

                    const description = descriptionElement.textContent || '';
                    const productMentions = this.extractProductsFromText(description);
                    
                    productMentions.forEach(product => {
                        if (!extractedProducts.find(p => p.name === product)) {
                            extractedProducts.push({
                                name: product,
                                source: 'tiktok',
                                hashtag: hashtag,
                                description: description.substring(0, 200),
                                url: window.location.href,
                                discovered_at: new Date().toISOString()
                            });
                        }
                    });
                });

                return extractedProducts;
            });

            return products;

        } catch (error) {
            console.error('TikTok scraping error:', error);
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    extractProductsFromText(text) {
        const products = [];
        
        // Product patterns to look for
        const patterns = [
            /(\w+\s+\w+(?:\s+\w+)?)\s+(?:from|on|at)\s+(?:amazon|aliexpress|wish)/gi,
            /#(\w+(?:\w+)?(?:product|gadget|device|tool))/gi,
            /this\s+(\w+(?:\s+\w+){1,3})\s+(?:is|was|will)/gi,
            /(\w+(?:\s+\w+){1,2})\s+(?:changed my life|is amazing|you need)/gi
        ];

        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleanProduct = match.replace(/[#@]/g, '').trim();
                    if (cleanProduct.length > 5 && cleanProduct.length < 50) {
                        products.push(cleanProduct);
                    }
                });
            }
        });

        return products;
    }

    async scrapeMultipleHashtags(hashtags) {
        const allProducts = [];

        for (const hashtag of hashtags) {
            console.log(`Scraping hashtag: ${hashtag}`);
            
            try {
                const products = await this.scrapeHashtag(hashtag);
                allProducts.push(...products);
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Error scraping ${hashtag}:`, error);
            }
        }

        return allProducts;
    }
}

// Usage example and export
const defaultHashtags = [
    'tiktokmademebuyit',
    'amazonfinds',
    'musthave',
    'productreview',
    'gadgets',
    'lifehacks'
];

module.exports = { TikTokScraper, defaultHashtags };

// CLI usage
if (require.main === module) {
    (async () => {
        const scraper = new TikTokScraper();
        const products = await scraper.scrapeMultipleHashtags(defaultHashtags.slice(0, 2));
        console.log('Found products:', products);
    })();
}
