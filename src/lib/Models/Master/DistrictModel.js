const mongoose = require('mongoose');

const DistrictSchema = new mongoose.Schema({
    distId: {
        type: String,
        unique: true,
    },
    distName: {
        type: String,
        required: true,
        unique: true
    }
});

const DistrictModel = mongoose.models.District || mongoose.model('District', DistrictSchema);

module.exports = DistrictModel;
