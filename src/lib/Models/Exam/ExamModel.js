const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  standards: {
    type: [String], 
    required: true
  }
});

const ExamModel = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);

module.exports = ExamModel;
