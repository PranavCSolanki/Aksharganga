import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    SubjectName: {
        type: String,
        required: true,
    },
    SubjectId: {
        type: String,
    },
    ClassName: {
        type: String,
        required: true,
    }
});

SubjectSchema.index({ ClassName: 1, SubjectName: 1 }, { unique: true });

const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

export default SubjectModel;
