export interface CrawlResult {
  url: string;
  metaTitle: string;
  metaDescription: string;
  server?: string;
  statusCode: number;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  outgoingLinks: string[];
  incomingLinks: string[];
}
