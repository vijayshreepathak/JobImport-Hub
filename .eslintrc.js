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
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th>Started</th>
            <th>Ended</th>
            <th>File</th>
            <th>Total</th>
            <th>New</th>
            <th>Updated</th>
            <th>Failed</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.startedAt).toLocaleString()}</td>
              <td>{log.endedAt ? new Date(log.endedAt).toLocaleString() : "-"}</td>
              <td>{log.fileName}</td>
              <td>{log.total}</td>
              <td>{log.newCount}</td>
              <td>{log.updatedCount}</td>
              <td>{log.failedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-2 py-1 border rounded"
        >
          Prev
        </button>
        <span>
          Page {page} / {Math.ceil(total / 20) || 1}
        </span>
        <button
          disabled={page * 20 >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-2 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}