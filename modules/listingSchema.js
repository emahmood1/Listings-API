const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({}, { strict: false });

module.exports = listingSchema;
