import mongoose from 'mongoose';

const OrganizeSchema = new mongoose.Schema({
  id: {
    type: Number,
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
  taluka: {
    type: String,
    required: true
  },
  centers: {
    type: String, 
    required: true,
    unique:true
  },
  centerId: {
    type: Number, 
    required: true,
    unique:true
  }
});

const OrganizeModel = mongoose.models.Organize || mongoose.model('Organize', OrganizeSchema);

export default OrganizeModel;
