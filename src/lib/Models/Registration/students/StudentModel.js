const { default: mongoose } = require("mongoose");

const studentSchema = new mongoose.Schema({
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
    centerId:{
    type: Number,
    require:true
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
      type: String,
    },
    Class: {
      type: String,
      required: true,
    },
    ClassId: {
      type: Number,
      required: true,
    },
    medium: {
      type: String,
      required: true,
    },
  });
  
  const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);
  
  module.exports = StudentModel;
  