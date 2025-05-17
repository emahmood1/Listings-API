/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* Name: Ehsan Mahmood     Student ID: 115028227     Date: 15/05/2025
* Published URL: https://github.com/emahmood1/listingsAPI
********************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ListingsDB = require("./modules/listingsDB");

dotenv.config();

// Instantiate and initialize your DB once on cold start:
const db = new ListingsDB();
const dbInit = db
  .initialize(process.env.MONGODB_CONN_STRING)
  .catch((err) => console.error("DB init error:", err));

const app = express();
app.use(cors());
app.use(express.json());

/** Health-check **/
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

/** POST /api/listings **/
app.post("/api/listings", async (req, res) => {
  try {
    const newDoc = await db.addNewListing(req.body);
    res.status(201).json(newDoc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** GET /api/listings **/
app.get("/api/listings", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const name = req.query.name;
  try {
    const docs = await db.getAllListings(page, perPage, name);
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** GET /api/listings/:id **/
app.get("/api/listings/:id", async (req, res) => {
  try {
    const doc = await db.getListingById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Listing not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** PUT /api/listings/:id **/
app.put("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** DELETE /api/listings/:id **/
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    return res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// If run with `node server.js`, start the HTTP server.
// Otherwise (on Vercel), export an async req/res handler.
if (require.main === module) {
  dbInit.then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`Server listening on http://localhost:${PORT}`)
    );
  });
} else {
  module.exports = async (req, res) => {
    // wait for DB to connect
    await dbInit;
    // dispatch into Express
    return app(req, res);
  };
}
