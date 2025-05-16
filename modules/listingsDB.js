const mongoose = require("mongoose");
const listingSchema = require("./listingSchema");

class ListingsDB {
  constructor() {
    this.Listing = null;
  }

  initialize(connectionString) {
    return mongoose
      .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((mongooseInstance) => {
        this.Listing = mongooseInstance.model(
          "listingsAndReviews",
          listingSchema,
          "listingsAndReviews"
        );
      });
  }

  addNewListing(data) {
    const doc = new this.Listing(data);
    return doc.save();
  }

  getAllListings(page = 1, perPage = 5, name) {
    const filter = {};
    if (name) filter.name = new RegExp(name, "i");
    const skip = (page - 1) * perPage;
    return this.Listing.find(filter)
      .sort({ number_of_reviews: -1 })
      .skip(skip)
      .limit(perPage)
      .exec();
  }

  getListingById(id) {
    return this.Listing.findById(id).exec();
  }

  updateListingById(data, id) {
    return this.Listing.updateOne({ _id: id }, { $set: data }).exec();
  }

  deleteListingById(id) {
    return this.Listing.deleteOne({ _id: id }).exec();
  }
}

module.exports = ListingsDB;
