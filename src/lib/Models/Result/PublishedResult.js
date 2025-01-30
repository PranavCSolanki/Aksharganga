const mongoose = require('mongoose');

const publishSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  exam: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  center: {
    type: String,
    required: true
  },
  taluka: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  standard: {
    type: String,
    required: true
  },
  medium: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  subjects: [{
    subject: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      default: 0,
    },
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  RankType: {
    type: String,
    required: true
  },
  Rank: {
    type: Number,
    required: true
  },
 
});

// Check if the model already exists before defining it
const publishModel = mongoose.models.publish || mongoose.model('publish', publishSchema);

module.exports = publishModel;
