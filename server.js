/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* Name: Ehsan Mahmood     Student ID: 115028227     Date: 15/05/2025
* Published URL: https://github.com/emahmood1/Listings-API
********************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const ListingsDB = require("./modules/listingsDB");

dotenv.config();


const db = new ListingsDB();
const dbInit = db
  .initialize(process.env.MONGODB_CONN_STRING)
  .catch((err) => console.error("DB init error:", err));

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});


app.post("/api/listings", async (req, res) => {
  try {
    const data = await db.addNewListing(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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

/**
 * GET    /api/listings/:id
 */
app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT    /api/listings/:id
 */
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

/**
 * DELETE /api/listings/:id
 */
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create the serverless handler
const handler = serverless(app);

// Export an async wrapper that waits for the DB init before handling
module.exports = async (req, res) => {
  await dbInit;
  return handler(req, res);
};
