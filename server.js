/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* Name: ______________________  Student ID: ______________  Date: ___________
* Published URL: ___________________________________________________________
********************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const ListingsDB = require("./modules/listingsDB");

dotenv.config();
const db = new ListingsDB();

// Initialize the database once when the function cold-starts.
// Any errors here will be logged but won’t crash at import time.
db.initialize(process.env.MONGODB_CONN_STRING).catch((err) =>
  console.error("DB init error:", err)
);

const app = express();
app.use(cors());
app.use(express.json());

// Health‐check route
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

// Create a new listing
app.post("/api/listings", async (req, res) => {
  try {
    const data = await db.addNewListing(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get listings (with pagination & optional name filter)
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

// Get one listing by ID
app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a listing by ID
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

// Delete a listing by ID
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    // 204 No Content
    return res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// **This is the magic line** that exports your Express app
// as a Vercel-compatible serverless function:
module.exports = serverless(app);
