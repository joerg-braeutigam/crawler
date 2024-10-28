import puppeteer from "puppeteer";
import type { CrawlResult } from "./types";

const visited = new Set<string>();
const results: CrawlResult[] = [];

function normalizeURL(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return "";
  }
}

function isValidUrl(url: string, baseUrl: string): boolean {
  try {
    const parsedUrl = new URL(url, baseUrl);
    const parsedBase = new URL(baseUrl);
    return parsedUrl.hostname === parsedBase.hostname;
  } catch {
    return false;
  }
}

async function crawlPage(
  browser: puppeteer.Browser,
  url: string,
  baseUrl: string
): Promise<void> {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable request interception to get response status
    await page.setRequestInterception(true);
    let statusCode = 200;
    let serverHeader = "";

    page.on("request", (request) => {
      request.continue();
    });

    page.on("response", (response) => {
      if (response.url() === url) {
        statusCode = response.status();
        serverHeader = response.headers()["server"] || "";
      }
    });

    // Navigate to the page with a timeout
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Extract data using page.evaluate
    const pageData = await page.evaluate(() => {
      const getMetaContent = (selector: string) => {
        const element = document.querySelector(selector);
        return element ? (element as HTMLMetaElement).content : "";
      };

      const getHeadings = (tag: string) => {
        return Array.from(document.getElementsByTagName(tag)).map(
          (h) => h.textContent || ""
        );
      };

      const links = Array.from(document.getElementsByTagName("a"))
        .map((a) => a.href)
        .filter((href) => href && !href.startsWith("javascript:"));

      return {
        title: document.title,
        metaDescription:
          getMetaContent('meta[name="description"]') ||
          getMetaContent('meta[property="og:description"]'),
        ogTitle: getMetaContent('meta[property="og:title"]'),
        headings: {
          h1: getHeadings("h1"),
          h2: getHeadings("h2"),
          h3: getHeadings("h3"),
          h4: getHeadings("h4"),
          h5: getHeadings("h5"),
          h6: getHeadings("h6"),
        },
        links,
      };
    });

    const result: CrawlResult = {
      url,
      statusCode,
      metaTitle: pageData.title || pageData.ogTitle || "",
      metaDescription: pageData.metaDescription || "",
      server: serverHeader || undefined,
      headings: pageData.headings,
      outgoingLinks: pageData.links
        .map((link) => normalizeURL(link, url))
        .filter((link) => link && isValidUrl(link, baseUrl)),
      incomingLinks: [],
    };

    results.push(result);

    // Close the page to free up resources
    await page.close();

    // Crawl discovered links
    const promises = result.outgoingLinks.map((link) =>
      crawlPage(browser, link, baseUrl)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    results.push({
      url,
      statusCode: 500,
      metaTitle: "",
      metaDescription: "",
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      outgoingLinks: [],
      incomingLinks: [],
    });
  }
}

export async function crawlWebsite(url: string): Promise<CrawlResult[]> {
  // Reset state for new crawl
  visited.clear();
  results.length = 0;

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
  });

  try {
    await crawlPage(browser, url, url);

    // Process incoming links
    results.forEach((page) => {
      page.incomingLinks = results
        .filter((otherPage) => otherPage.outgoingLinks.includes(page.url))
        .map((otherPage) => otherPage.url);
    });

    return results;
  } finally {
    await browser.close();
  }
}
