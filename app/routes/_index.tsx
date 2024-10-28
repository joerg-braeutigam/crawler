import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Search, Loader2, X } from "lucide-react";
import { useState } from "react";
import { crawlWebsite } from "~/utils/crawler";
import type { CrawlResult } from "~/utils/types";
import TableFilters from "~/components/TableFilters";
import ResultsTable from "~/components/ResultsTable";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return json({ error: "URL is required" });
  }

  try {
    const results = await crawlWebsite(url);
    return json({ results });
  } catch (error) {
    return json({ error: "Failed to crawl website" });
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedPage, setSelectedPage] = useState<CrawlResult | null>(null);
  const isSubmitting = navigation.state === "submitting";
  const [filters, setFilters] = useState({
    url: "",
    title: "",
    description: "",
    h1: "",
    statusCode: "All",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredResults = actionData?.results?.filter((page) => {
    const matchesUrl = page.url
      .toLowerCase()
      .includes(filters.url.toLowerCase());
    const matchesTitle = page.metaTitle
      .toLowerCase()
      .includes(filters.title.toLowerCase());
    const matchesDescription = page.metaDescription
      .toLowerCase()
      .includes(filters.description.toLowerCase());
    const matchesH1 = (page.headings.h1[0] || "")
      .toLowerCase()
      .includes(filters.h1.toLowerCase());
    const matchesStatus =
      filters.statusCode === "All" ||
      (filters.statusCode === "3xx" &&
        page.statusCode >= 300 &&
        page.statusCode < 400) ||
      page.statusCode.toString() === filters.statusCode;

    return (
      matchesUrl &&
      matchesTitle &&
      matchesDescription &&
      matchesH1 &&
      matchesStatus
    );
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 flex flex-col h-screen max-h-screen">
        <div className="flex-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Website Crawler & Analyzer
          </h1>

          <Form method="post" className="mb-8">
            <div className="flex gap-4">
              <input
                type="url"
                name="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {isSubmitting ? "Crawling..." : "Crawl"}
              </button>
            </div>
          </Form>

          {actionData?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {actionData.error}
            </div>
          )}
        </div>

        {actionData?.results && (
          <div className="flex-1 flex flex-col space-y-6 min-h-0">
            <TableFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <div className="flex-1 overflow-auto bg-white rounded-lg shadow min-h-0">
              <ResultsTable
                results={filteredResults || []}
                onSelectPage={setSelectedPage}
                selectedPage={selectedPage}
              />
            </div>

            {selectedPage && (
              <div className="flex-1 overflow-auto bg-white rounded-lg shadow min-h-0">
                <div className="p-6">
                  <div className="flex justify-between items-center sticky top-0 bg-white pb-4 mb-4 border-b">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">Page Details</h2>
                      <p className="text-sm text-gray-500">
                        {selectedPage.url}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPage(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">
                        Meta Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <p>
                          <span className="font-medium">Title:</span>{" "}
                          {selectedPage.metaTitle}
                        </p>
                        <p>
                          <span className="font-medium">Description:</span>{" "}
                          {selectedPage.metaDescription}
                        </p>
                        <p>
                          <span className="font-medium">Server:</span>{" "}
                          {selectedPage.server || "Unknown"}
                        </p>
                        <p>
                          <span className="font-medium">Status Code:</span>{" "}
                          {selectedPage.statusCode}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">Headings</h3>
                      <div className="mt-2 space-y-2">
                        {Object.entries(selectedPage.headings).map(
                          ([level, headings]) => (
                            <div key={level}>
                              <p className="font-medium">
                                {level.toUpperCase()}:
                              </p>
                              <ul className="list-disc list-inside">
                                {headings.map((heading, index) => (
                                  <li key={index} className="text-gray-600">
                                    {heading}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">Links</h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <p className="font-medium">Outgoing Links:</p>
                          <ul className="list-disc list-inside">
                            {selectedPage.outgoingLinks.map((link, index) => (
                              <li
                                key={index}
                                className="text-blue-600 truncate hover:text-clip hover:whitespace-normal"
                              >
                                {link}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">Incoming Links:</p>
                          <ul className="list-disc list-inside">
                            {selectedPage.incomingLinks.map((link, index) => (
                              <li
                                key={index}
                                className="text-blue-600 truncate hover:text-clip hover:whitespace-normal"
                              >
                                {link}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
