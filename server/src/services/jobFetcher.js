import axios from "axios";
import xml2js from "xml2js";

// Parse XML to JSON
export async function fetchAndParseXML(url) {
  const { data } = await axios.get(url, { timeout: 15000 });
  const result = await xml2js.parseStringPromise(data, { explicitArray: false });
  return result;
}

// Normalize job data from feed
export function normalizeJobs(feedJson, source) {
  const jobs = [];
  const items = feedJson.rss?.channel?.item || [];
  (Array.isArray(items) ? items : [items]).forEach((item) => {
    jobs.push({
      external_id: item.guid || item.id || item.link,
      source,
      title: item.title,
      description: item.description,
      url: item.link,
      company: item["job:company"] || item.company,
      location: item["job:location"] || item.location,
      postedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      raw: item
    });
  });
  return jobs;
}
