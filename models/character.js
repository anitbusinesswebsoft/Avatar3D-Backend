const mongoose = require("mongoose");
const { Schema } = mongoose;

const characterSchema = new Schema({
    characterName: {
        type: String,
        required: true
    },
    characterType: {
        type: String,
        required: true
    },
    characterGuid: {
        type: String
    },
    gblGuid: {
        type: String
    },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Character', characterSchema);