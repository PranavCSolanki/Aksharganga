const { default: mongoose } = require("mongoose");

const GeneratedSchema = new mongoose.Schema({
    exam: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    taluka: {
      type: String,
      required: true,
    },
    center: {
      type: String,
      required: true,
    },
  rollNo: {
    type: Number,
    required: true,
    unique: true
  },    
    studName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    mobNo: {
      type: Number,
    },
    Class: {
      type: String,
      required: true,
    },
    medium: {
      type: String,
      required: true,
    },
  });
  
  const GeneratedRollModel = mongoose.models.Generated || mongoose.model('Generated', GeneratedSchema);
  
  module.exports = GeneratedRollModel;
  