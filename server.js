/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* Name: Ehsan Mahmood Student ID: 115028227 Date: 15/05/2025
* Published URL: https://github.com/emahmood1/listingsAPI
********************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const db = require("./modules/listingsDB");

dotenv.config();

// Kick off the DB initialization _once_ at cold‐start
const dbInit = db
  .initialize(process.env.MONGODB_CONN_STRING)   // from your listingsDB.js :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  .catch((err) => console.error("DB init error:", err));

const app = express();
app.use(cors());
app.use(express.json());

// Health‐check
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

// Create
app.post("/api/listings", async (req, res) => {
  try {
    const data = await db.addNewListing(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read (with pagination & name filter)
app.get("/api/listings", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const name = req.query.name;
  try {
    const data = await db.getAllListings(page, perPage, name);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    return res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Build the Vercel serverless handler
const handler = serverless(app);

// Export a wrapper that awaits the DB init before handling any request.
// This prevents the function from hanging while Mongoose buffers
// commands waiting for a connection :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}.
module.exports = async (req, res) => {
  await dbInit;
  return handler(req, res);
};
