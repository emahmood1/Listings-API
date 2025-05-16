const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  summary: String,
  property_type: String,
  bedrooms: Number,
  bathrooms: Number,
  beds: Number,
  number_of_reviews: { type: Number, default: 0 },
  address: {
    market: String,
    country: String,
    street: String,
    suburb: String,
    government_area: String,
    location: {
      type: { type: String },
      coordinates: [Number],
    },
  },
  images: {
    thumbnail_url: String,
    picture_url: String,
    xl_picture_url: String,
  },
}, {
  strict: false,
});

module.exports = listingSchema;
