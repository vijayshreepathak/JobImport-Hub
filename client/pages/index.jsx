import Layout from "../components/Layout";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:4000/api/progress");
    evtSource.onmessage = (e) => {
      setStatus(JSON.parse(e.data));
    };
    return () => evtSource.close();
  }, []);

  return (
    <Layout>
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-blue-200">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-800 drop-shadow-lg">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Job Importer Dashboard
          </span>
        </h1>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-2xl shadow mb-4 border border-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Latest Import Status</h2>
          {status ? (
            <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 overflow-x-auto">{JSON.stringify(status, null, 2)}</pre>
          ) : (
            <p className="text-gray-500 italic">No recent import activity.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}