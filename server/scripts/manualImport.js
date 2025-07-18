import { fetchAndParseXML, normalizeJobs } from "../src/services/jobFetcher.js";
import fs from "fs";
import path from "path";

describe("XML Parser", () => {
  it("parses and normalizes jobs from sample XML", async () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <guid>123</guid>
            <title>Test Job</title>
            <description>Test Desc</description>
            <link>https://example.com/job/123</link>
            <job:company>TestCo</job:company>
            <job:location>Remote</job:location>
            <pubDate>2024-07-17T12:00:00Z</pubDate>
          </item>
        </channel>
      </rss>
    `;
    const feedJson = await fetchAndParseXML("data:text/xml," + encodeURIComponent(xml));
    const jobs = normalizeJobs(feedJson, "test-source");
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs[0]).toHaveProperty("external_id", "123");
    expect(jobs[0]).toHaveProperty("source", "test-source");
    expect(jobs[0]).toHaveProperty("title", "Test Job");
  });
});