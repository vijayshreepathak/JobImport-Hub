import Layout from "../components/Layout";
import ImportHistoryTable from "../components/ImportHistoryTable";
import { useState } from "react";

export default function History() {
  const [filters, setFilters] = useState({ start: "", end: "" });

  return (
    <Layout>
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-purple-200">
        <h1 className="text-4xl font-extrabold mb-6 text-purple-800 drop-shadow-lg">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Import History
          </span>
        </h1>
        <div className="mb-8 flex gap-4">
          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))}
            className="border p-2 rounded shadow focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))}
            className="border p-2 rounded shadow focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <ImportHistoryTable filters={filters} />
      </div>
    </Layout>
  );
}
