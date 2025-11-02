import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  try {
    if (browser && (await browser.version())) {
      return browser;
    }
  } catch (e) {
    console.warn("♻️ Browser instance lost, relaunching...");
    browser = null;
  }

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu",
      "--single-process",
    ],
  });

  // Auto-close on process exit
  process.on("exit", async () => {
    if (browser) await browser.close().catch(() => {});
  });

  return browser;
}
