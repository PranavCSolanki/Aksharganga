const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    ClassId: {
        type: Number,
        unique: true,
    },
    ClassName: {
        type: String,
        required: true,
        unique: true
    }
});

const ClassModel = mongoose.models.Class || mongoose.model('Class', ClassSchema);

module.exports = ClassModel;
