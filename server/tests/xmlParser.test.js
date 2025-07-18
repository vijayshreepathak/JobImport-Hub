import xml2js from "xml2js";
import axios from "axios";
import { normalizeJobs } from "../src/services/jobFetcher.js";

test("parses and normalizes jobs from sample XML", async () => {
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
  const feedJson = await xml2js.parseStringPromise(xml, { explicitArray: false });
  const jobs = normalizeJobs(feedJson, "test-source");
  expect(Array.isArray(jobs)).toBe(true);
  expect(jobs[0]).toHaveProperty("external_id", "123");
});

const feeds = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm"
];

test.each(feeds)(
  "fetches and parses real job feed XML to JSON: %s",
  async (url) => {
    const { data } = await axios.get(url, { timeout: 20000 });
    if (url.includes("higheredjobs.com")) {
      await expect(xml2js.parseStringPromise(data, { explicitArray: false })).rejects.toThrow();
      return;
    }
    const json = await xml2js.parseStringPromise(data, { explicitArray: false });
    const items = json.rss?.channel?.item || json.rss?.item || json.channel?.item || [];
    const jobs = normalizeJobs(json, url);
    // Print the first job for this feed
    console.log(`First job from ${url}:`, jobs[0]);
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  },
  30000
);
