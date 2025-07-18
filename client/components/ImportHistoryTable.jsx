import { useEffect, useState } from "react";
import axios from "axios";

export default function ImportHistoryTable({ filters }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = { page, limit: 20, ...filters };
    axios
      .get("http://localhost:4000/api/history", { params })
      .then((res) => {
        setLogs(res.data.logs);
        setTotal(res.data.total);
      });
  }, [page, filters.start, filters.end]);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full bg-white rounded-xl">
          <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
            <tr>
              <th className="py-3 px-4">Started</th>
              <th className="py-3 px-4">Ended</th>
              <th className="py-3 px-4">File</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">New</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4">Failed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="text-center border-b last:border-b-0 hover:bg-blue-50 transition">
                <td className="py-2 px-4">{new Date(log.startedAt).toLocaleString()}</td>
                <td className="py-2 px-4">{log.endedAt ? new Date(log.endedAt).toLocaleString() : "-"}</td>
                <td className="py-2 px-4">{log.fileName}</td>
                <td className="py-2 px-4">{log.total}</td>
                <td className="py-2 px-4 text-green-700 font-bold">{log.newCount}</td>
                <td className="py-2 px-4 text-blue-700 font-bold">{log.updatedCount}</td>
                <td className="py-2 px-4 text-red-700 font-bold">{log.failedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex gap-4 items-center justify-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-300 shadow"
        >
          Prev
        </button>
        <span className="font-semibold">
          Page {page} / {Math.ceil(total / 20) || 1}
        </span>
        <button
          disabled={page * 20 >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-300 shadow"
        >
          Next
        </button>
      </div>
    </div>
  );
}
