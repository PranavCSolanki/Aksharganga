const mongoose = require("mongoose");

const CoOrdinatorSchema = new mongoose.Schema({
  CoOrdinatorId: {
    type: String,
    unique: true,
    required: true,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Mobile1: {
    type: Number,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
});

const CoOrdinatorModel =
  mongoose.models.CoOrdinator ||
  mongoose.model("CoOrdinator", CoOrdinatorSchema);

module.exports = CoOrdinatorModel;
