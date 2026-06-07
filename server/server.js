/**
 * Railway API Proxy Server
 * ─────────────────────────
 * Handles: Anify streaming sources, request caching, rate limiting
 *
 * Deploy on Railway, set RAILWAY_API_URL in your Vercel env.
 * Run: node server.js
 */

const express = require("express");
const cors = require("cors");
const NodeCache = require("node-cache");
const axios = require("axios");

const app = express();
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const PORT = process.env.PORT || 3001;
const ANIFY_BASE = process.env.ANIFY_API_URL || "https://api.anify.tv";
const ANIFY_KEY = process.env.ANIFY_API_KEY;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["GET", "POST"],
}));

// Simple in-memory rate limiter per IP
const rateLimits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60_000;
  const maxReqs = 60;

  const entry = rateLimits.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > windowMs) {
    rateLimits.set(ip, { count: 1, start: now });
    return next();
  }
  if (entry.count >= maxReqs) {
    return res.status(429).json({ error: "Too many requests" });
  }
  entry.count++;
  rateLimits.set(ip, entry);
  next();
}

app.use(rateLimit);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", service: "animex-proxy" }));

// ── Anify: Episode sources ─────────────────────────────────────
app.get("/sources", async (req, res) => {
  const { id, providerId = "gogoanime", episode, subType = "sub" } = req.query;
  if (!id || !episode) return res.status(400).json({ error: "Missing id or episode" });

  const cacheKey = `sources:${id}:${providerId}:${episode}:${subType}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `${ANIFY_BASE}/sources?id=${id}&providerId=${providerId}&watchId=${id}-episode-${episode}&episode=${episode}&subType=${subType}&server=default`;
    const { data } = await axios.get(url, {
      headers: ANIFY_KEY ? { Authorization: `Bearer ${ANIFY_KEY}` } : {},
      timeout: 15_000,
    });
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error("[Anify sources]", err.message);
    res.status(502).json({ error: "Failed to fetch sources", sources: [], subtitles: [] });
  }
});

// ── Anify: Episodes list ───────────────────────────────────────
app.get("/episodes/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `episodes:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(`${ANIFY_BASE}/episodes/${id}?fields=[episodes]`, {
      headers: ANIFY_KEY ? { Authorization: `Bearer ${ANIFY_KEY}` } : {},
      timeout: 10_000,
    });
    cache.set(cacheKey, data, 3600);
    res.json(data);
  } catch (err) {
    console.error("[Anify episodes]", err.message);
    res.status(502).json({ error: "Failed to fetch episodes" });
  }
});

// ── Anify: Info ────────────────────────────────────────────────
app.get("/info/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `info:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(`${ANIFY_BASE}/info/${id}`, {
      headers: ANIFY_KEY ? { Authorization: `Bearer ${ANIFY_KEY}` } : {},
      timeout: 10_000,
    });
    cache.set(cacheKey, data, 7200);
    res.json(data);
  } catch (err) {
    console.error("[Anify info]", err.message);
    res.status(502).json({ error: "Failed to fetch info" });
  }
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 AnimeX proxy running on port ${PORT}`);
});
