import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Company</th>
              <th className="border px-2 py-1">Location</th>
              <th className="border px-2 py-1">Source</th>
              <th className="border px-2 py-1">Link</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{job.title || job["job:position"] || job["job_listing:position"]}</td>
                <td className="border px-2 py-1">{job["job:company"] || job["job_listing:company"] || job.company}</td>
                <td className="border px-2 py-1">{job["job:location"] || job["job_listing:location"] || job.location}</td>
                <td className="border px-2 py-1">{job.source}</td>
                <td className="border px-2 py-1">
                  <a href={job.link || job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
