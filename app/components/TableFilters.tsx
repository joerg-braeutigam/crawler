import React from "react";

interface TableFiltersProps {
  filters: {
    url: string;
    title: string;
    description: string;
    h1: string;
    statusCode: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function TableFilters({
  filters,
  onFilterChange,
}: TableFiltersProps) {
  const statusCodes = ["All", "200", "3xx", "404", "500"];

  return (
    <div className="grid grid-cols-5 gap-4 mb-4 bg-white p-4 rounded-lg shadow">
      <div>
        <label
          htmlFor="urlFilter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          URL Filter
        </label>
        <input
          id="urlFilter"
          type="text"
          value={filters.url}
          onChange={(e) => onFilterChange("url", e.target.value)}
          placeholder="Filter by URL..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="titleFilter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Title Filter
        </label>
        <input
          id="titleFilter"
          type="text"
          value={filters.title}
          onChange={(e) => onFilterChange("title", e.target.value)}
          placeholder="Filter by title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="descriptionFilter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Description Filter
        </label>
        <input
          id="descriptionFilter"
          type="text"
          value={filters.description}
          onChange={(e) => onFilterChange("description", e.target.value)}
          placeholder="Filter by description..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="h1Filter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          H1 Filter
        </label>
        <input
          id="h1Filter"
          type="text"
          value={filters.h1}
          onChange={(e) => onFilterChange("h1", e.target.value)}
          placeholder="Filter by H1..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="statusFilter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Status Code
        </label>
        <select
          id="statusFilter"
          value={filters.statusCode}
          onChange={(e) => onFilterChange("statusCode", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {statusCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
