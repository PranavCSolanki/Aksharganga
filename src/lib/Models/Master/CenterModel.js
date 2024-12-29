const mongoose = require("mongoose");

const CenterSchema = new mongoose.Schema({
  CenterId: {
    type: Number,
    unique: true,
    required: true,
  },
  District: {
    type: String,
    required: true,
  },
  Taluka: {
    type: String,
    required: true,
  },
  CoOrdinator: {
    type: String,
    required: true,
  },
  CenterName: {
    type: String,
    required: true,
  }
});

const CenterModel =
  mongoose.models.Center ||
  mongoose.model("Center", CenterSchema);

module.exports = CenterModel;
