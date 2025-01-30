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
  Standard: {  
    type: String,
    required: true,
  },
 
  StudentName: {
    type: String,
    required: true
  },
  RollNo: {
    type: Number,
    required: true,
    unique: true,  // Added unique constraint
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
  school: {
    type: String,
    required: true,
  },
  medium: {
    type: String,
    required: true,
  }
});

const ResultModel = mongoose.models.Result || mongoose.model('Result', ResultSchema);
export default ResultModel;
