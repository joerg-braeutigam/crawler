import React from "react";
import type { CrawlResult } from "~/utils/types";

interface ResultsTableProps {
  results: CrawlResult[];
  onSelectPage: (page: CrawlResult) => void;
  selectedPage?: CrawlResult | null;
}

export default function ResultsTable({
  results,
  onSelectPage,
  selectedPage,
}: ResultsTableProps) {
  const getStatusColor = (statusCode: number) => {
    if (statusCode === 200) return "text-green-600";
    if (statusCode >= 300 && statusCode < 400) return "text-yellow-600";
    if (statusCode >= 400) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50 sticky top-0">
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {results.map((page, index) => (
          <tr
            key={index}
            onClick={() => onSelectPage(page)}
            className={`hover:bg-orange-50 cursor-pointer ${
              selectedPage?.url === page.url ? "bg-orange-100" : ""
            }`}
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
            <td
              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(
                page.statusCode
              )}`}
            >
              {page.statusCode}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
