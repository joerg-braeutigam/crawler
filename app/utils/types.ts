import * as cheerio from "cheerio";
import fetch from "node-fetch";
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

async function crawlPage(url: string, baseUrl: string): Promise<void> {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const result: CrawlResult = {
      url,
      metaTitle:
        $("title").text() ||
        $('meta[property="og:title"]').attr("content") ||
        "",
      metaDescription:
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "",
      server: response.headers.get("server") || undefined,
      headings: {
        h1: $("h1")
          .map((_, el) => $(el).text())
          .get(),
        h2: $("h2")
          .map((_, el) => $(el).text())
          .get(),
        h3: $("h3")
          .map((_, el) => $(el).text())
          .get(),
        h4: $("h4")
          .map((_, el) => $(el).text())
          .get(),
        h5: $("h5")
          .map((_, el) => $(el).text())
          .get(),
        h6: $("h6")
          .map((_, el) => $(el).text())
          .get(),
      },
      outgoingLinks: [],
      incomingLinks: [],
    };

    // Collect outgoing links
    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        const normalizedUrl = normalizeURL(href, url);
        if (normalizedUrl && isValidUrl(normalizedUrl, baseUrl)) {
          result.outgoingLinks.push(normalizedUrl);
        }
      }
    });

    results.push(result);

    // Crawl discovered links
    const promises = result.outgoingLinks.map((link) =>
      crawlPage(link, baseUrl)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
  }
}

export async function crawlWebsite(url: string): Promise<CrawlResult[]> {
  // Reset state for new crawl
  visited.clear();
  results.length = 0;

  await crawlPage(url, url);

  // Process incoming links
  results.forEach((page) => {
    page.incomingLinks = results
      .filter((otherPage) => otherPage.outgoingLinks.includes(page.url))
      .map((otherPage) => otherPage.url);
  });

  return results;
}
