const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoryColorSchema = new Schema({
    categoryId: {
        type: mongoose.ObjectId
    },
    colorCode: {
        type: Array
    },
    isDeleted: {
        type: Boolean
    },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CategoryColor', categoryColorSchema);