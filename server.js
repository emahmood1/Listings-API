/*****************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* Name: Ehsan Mahmood Student ID: 115028227 Date: 15/05/2025
* Published URL: https://github.com/emahmood1/listingsAPI
*****************************************************************************/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ListingsDB = require("./modules/listingsDB.js");

dotenv.config();

const HTTP_PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const db = ListingsDB;

db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

// Define routes
app.post("/api/listings", (req, res) => {
    db.addNewListing(req.body).then(data => res.status(201).json(data))
    .catch(err => res.status(500).json({ message: err }));
});

app.get("/api/listings", (req, res) => {
    const { page, perPage, name } = req.query;
    db.getAllListings(page, perPage, name).then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err }));
});

app.get("/api/listings/:id", (req, res) => {
    db.getListingById(req.params.id).then(data => res.json(data))
    .catch(err => res.status(404).json({ message: err }));
});

app.put("/api/listings/:id", (req, res) => {``
    db.updateListingById(req.body, req.params.id).then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err }));
});

app.delete("/api/listings/:id", (req, res) => {
    db.deleteListingById(req.params.id).then(data => res.json(data))
    .catch(err => res.status(500).json({ message: err }));
});
