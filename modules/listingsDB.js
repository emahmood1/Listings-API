const mongoose = require("mongoose");
const listingSchema = require("./listingSchema");

let Listing;

module.exports = {
  initialize: function (connectionString) {
  return new Promise((resolve, reject) => {
    mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        Listing = mongoose.model("listingsAndReviews", listingSchema, "listingsAndReviews");
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
},

  addNewListing: function (data) {
    const newListing = new Listing(data);
    return newListing.save();
  },

  getAllListings: function (page, perPage, name) {
  return Listing.find({})
    .sort({ number_of_reviews: -1 })
    .limit(5)
    .exec();
},

  getListingById: function (id) {
    return Listing.findOne({ _id: id }).exec();
  },

  updateListingById: function (data, id) {
    return Listing.updateOne({ _id: id }, { $set: data }).exec();
  },

  deleteListingById: function (id) {
    return Listing.deleteOne({ _id: id }).exec();
  },
};
