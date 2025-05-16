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
const ListingsDB = require("./modules/listingsDB");

dotenv.config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const db = new ListingsDB();

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => console.error(err));

// Root health‐check route
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});  
// :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}

// Create a new listing
app.post("/api/listings", (req, res) => {
  db.addNewListing(req.body)
    .then((data) => res.status(201).json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

// Get listings (with page, perPage & optional name filter)
app.get("/api/listings", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const name = req.query.name;
  db.getAllListings(page, perPage, name)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

// Get one listing by ID
app.get("/api/listings/:id", (req, res) => {
  db.getListingById(req.params.id)
    .then((data) => {
      if (!data) return res.status(404).json({ message: "Listing not found" });
      res.json(data);
    })
    .catch((err) => res.status(500).json({ message: err }));
});

// Update a listing by ID
app.put("/api/listings/:id", (req, res) => {
  db.updateListingById(req.body, req.params.id)
    .then((result) => {
      if (result.modifiedCount > 0) return res.json({ message: "Listing updated" });
      res.status(404).json({ message: "Listing not found" });
    })
    .catch((err) => res.status(500).json({ message: err }));
});

// Delete a listing by ID
app.delete("/api/listings/:id", (req, res) => {
  db.deleteListingById(req.params.id)
    .then((result) => {
      if (result.deletedCount > 0) return res.status(204).end();
      res.status(404).json({ message: "Listing not found" });
    })
    .catch((err) => res.status(500).json({ message: err }));
});
