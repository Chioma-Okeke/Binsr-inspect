import puppeteer, { Browser, Page } from "puppeteer";

class BrowserPool {
    private static instance: BrowserPool;
    private browser: Browser | null = null;
    private isInitializing = false;
    private pages: Page[] = [];
    private maxPages = 3; // Limit concurrent pages

    private constructor() {}

    public static getInstance(): BrowserPool {
        if (!BrowserPool.instance) {
            BrowserPool.instance = new BrowserPool();
        }
        return BrowserPool.instance;
    }

    public async getBrowser(): Promise<Browser> {
        if (this.browser && this.browser.isConnected()) {
            return this.browser;
        }

        if (this.isInitializing) {
            // Wait for initialization to complete
            while (this.isInitializing) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (this.browser && this.browser.isConnected()) {
                return this.browser;
            }
        }

        this.isInitializing = true;
        try {
            console.log("Launching new browser instance...");
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--disable-gpu",
                ],
                timeout: 30000,
            });

            // Handle browser disconnect
            this.browser.on("disconnected", () => {
                console.log("Browser disconnected");
                this.browser = null;
                this.pages = [];
            });

            console.log("Browser launched successfully");
            return this.browser;
        } finally {
            this.isInitializing = false;
        }
    }

    public async getPage(): Promise<Page> {
        const browser = await this.getBrowser();

        // Reuse existing page if available
        const availablePage = this.pages.find((page) => !page.isClosed());
        if (availablePage && this.pages.length < this.maxPages) {
            return availablePage;
        }

        // Create new page
        const page = await browser.newPage();

        // Optimize page settings for faster rendering
        await page.setViewport({ width: 1200, height: 800 });
        await page.setDefaultTimeout(15000);

        // Disable unnecessary resources for faster loading
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const resourceType = req.resourceType();
            // Only block external resources, keep inline styles
            if (resourceType === "font" || resourceType === "media") {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Additional optimizations
        await page.evaluateOnNewDocument(() => {
            // Disable animations for faster rendering
            const style = document.createElement("style");
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.001ms !important;
                    animation-delay: 0.001ms !important;
                    transition-duration: 0.001ms !important;
                    transition-delay: 0.001ms !important;
                }
            `;
            document.head.appendChild(style);
        });

        this.pages.push(page);

        // Clean up closed pages
        this.pages = this.pages.filter((p) => !p.isClosed());

        return page;
    }

    // Warm up the browser pool with pre-created pages
    public async warmUp(): Promise<void> {
        console.log("Warming up browser pool...");
        try {
            await this.getBrowser();

            // Pre-create a page for faster first request
            const page = await this.getPage();
            await this.releasePage(page);

            console.log("Browser pool warmed up successfully");
        } catch (error) {
            console.error("Error warming up browser pool:", error);
        }
    }

    public async releasePage(page: Page): Promise<void> {
        try {
            // Clear the page content but keep it for reuse
            await page.goto("about:blank");
        } catch (error) {
            console.error("Error releasing page:", error);
            // Remove from pool if error occurs
            this.pages = this.pages.filter((p) => p !== page);
            if (!page.isClosed()) {
                await page.close().catch(console.error);
            }
        }
    }

    public async cleanup(): Promise<void> {
        console.log("Cleaning up browser pool...");

        // Close all pages
        await Promise.all(
            this.pages.map((page) =>
                page
                    .close()
                    .catch((error) =>
                        console.error("Error closing page:", error)
                    )
            )
        );
        this.pages = [];

        // Close browser
        if (this.browser) {
            await this.browser
                .close()
                .catch((error) =>
                    console.error("Error closing browser:", error)
                );
            this.browser = null;
        }
    }

    // Graceful shutdown
    public async shutdown(): Promise<void> {
        await this.cleanup();
    }
}

// Global browser pool instance
export const browserPool = BrowserPool.getInstance();

// Graceful shutdown handlers
if (typeof process !== "undefined") {
    process.on("SIGTERM", async () => {
        await browserPool.shutdown();
        process.exit(0);
    });

    process.on("SIGINT", async () => {
        await browserPool.shutdown();
        process.exit(0);
    });
}
