const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main search endpoint - OpenWebUI External Search API compatible
app.post("/search", async (req, res) => {
  try {
    const { query, count = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing 'query' in request body" });
    }

    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

    // Build Brave Search API URL
    const params = new URLSearchParams({
      q: query,
      count: String(count),
      search_lang: "en",
      ui_lang: "en-US"
    });

    const braveResponse = await fetch(`${BRAVE_API_URL}?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!braveResponse.ok) {
      const errorText = await braveResponse.text();
      console.error(`Brave API error: ${braveResponse.status} - ${errorText}`);
      return res.json([]); // Return empty array on error
    }

    const braveData = await braveResponse.json();

    // Transform Brave results to OpenWebUI format
    const results = (braveData.web?.results || []).map((result) => ({
      link: result.url,
      title: result.title || "",
      snippet: result.description || "",
    }));

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.json([]); // Return empty array on error
  }
});

app.listen(PORT, () => {
  console.log(`Brave Search Proxy running on port ${PORT}`);
  console.log(`Search endpoint: POST http://localhost:${PORT}/search`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
});
