import mongoose from 'mongoose';

const TalukaSchema = new mongoose.Schema({
    TalukaName: {
        type: String,
        required: true,
        unique:true
    },
    TalukaId: {
        type: String,
    },
    distName: {
        type: String,
        required: true,
    }
});


const TalukaModel = mongoose.models.Taluka || mongoose.model('Taluka', TalukaSchema);

export default TalukaModel;
