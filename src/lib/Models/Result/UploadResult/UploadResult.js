import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  exam: {
    type: String,
    required: true,
  },
  center: {
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
  class: {
    type: String,
    required: true,
  },
  medium: {
    type: String,
    required: true,
  },
  RollNo: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    default: 0,
  },
  studName: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  }
});

const ResultModel = mongoose.models.Result || mongoose.model('Result', ResultSchema);
export default ResultModel;
