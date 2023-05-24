const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
    categoryId: {
        type: String
    },
    categoryName: {
        type: String
    },
    parentCategoryId: {
        type: String
    },
    isDeleted: {
        type: Boolean
    },
    displayOrder: {
        type: String
    },
    isCombinedCategory: {
        type: Boolean
    },
    combinedCategoryId: {
        type: String
    },
    isColorAvailable: {
        type: Boolean
    },
    categoryGuid: {
        type: String
    },
    gblGuid: {
        type: String
    },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);