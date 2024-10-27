import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { crawlWebsite } from "../utils/crawler";
import type { CrawlResult } from "../utils/types";

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

  return (
    <main className="container mx-auto px-4 py-8">
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

      {actionData?.results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    H1
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actionData.results.map((page, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedPage(page)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.metaTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.headings.h1?.[0] || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPage && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Page Details</h2>

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
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Headings</h3>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedPage.headings).map(
                      ([level, headings]) => (
                        <div key={level}>
                          <p className="font-medium">{level.toUpperCase()}:</p>
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
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Outgoing Links:</p>
                      <ul className="list-disc list-inside">
                        {selectedPage.outgoingLinks.map((link, index) => (
                          <li key={index} className="text-blue-600 truncate">
                            {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Incoming Links:</p>
                      <ul className="list-disc list-inside">
                        {selectedPage.incomingLinks.map((link, index) => (
                          <li key={index} className="text-blue-600 truncate">
                            {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
