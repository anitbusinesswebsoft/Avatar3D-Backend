const express = require('express');
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const categorySchema = require("../models/category")
const colorSchema = require("../models/categoryColor")
const {storage} = require("../functions/uploadfile")

let bucket;
mongoose.connection.on("connected", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connections[0].db, {
        bucketName: "newBucket"
    });
});

const upload = multer({
    storage
});

const colorCodee = async (category) => {
    const data = await colorSchema.findOne({ categoryId: category._id })
    return data.colorCode
}

router.post("/create", upload.fields([{ name: 'glbfile' }, { name: 'iconfile' }]), async (req, res) => {
    console.log("body is create ", req.files);
    const { categoryName, parentCategoryId, isDeleted, displayOrder, isCombinedCategory, combinedCategoryId, isColorAvailable } = req.body
    let { glbfile, iconfile } = req.files

    try {
        const newCategory = new categorySchema({
            categoryName,
            parentCategoryId: parentCategoryId || null,
            isDeleted,
            displayOrder,
            isCombinedCategory,
            combinedCategoryId: combinedCategoryId || null,
            isColorAvailable,
            categoryGuid: Array.isArray(iconfile) ? iconfile[0].filename : null,
            gblGuid: Array.isArray(glbfile) ? glbfile[0].filename : null
        })
        const categoryFile = await newCategory.save()

        if (isColorAvailable === "true") {
            const categoryColors = new colorSchema({
                categoryId: categoryFile._id,
                colorCode: req.body.colors.split(','),
                isDeleted: false
            })
            const colors = await categoryColors.save()
            res.json({ categoryFile, colors })
            return
        }
        res.status(201).json(categoryFile);
    } catch (error) {
        console.log("error ", error);
    }
});

router.post('/edit/:id', upload.fields([{ name: 'glbfile' }, { name: 'iconfile' }]), async (req, res) => {
    const { categoryName } = req.body
    let { glbfile, iconfile } = req.files
    const preData = await categorySchema.findById(req.params.id)
    const data = await categorySchema.findByIdAndUpdate(req.params.id, {
        categoryName: categoryName,
        categoryGuid: Array.isArray(iconfile) ? iconfile[0].filename : preData.categoryGuid,
        gblGuid: Array.isArray(glbfile) ? glbfile[0].filename : preData.gblGuid
    })
    const colorData = await colorSchema.findOneAndUpdate({ categoryId: req.params.id }, {
        colorCode: req.body.colors.split(',')
    })
    res.json({ data, colorData })
})

router.get('/getparentcategories', async (req, res) => {
    try {
        const results = await categorySchema.find({ displayOrder: 1 })
        for (let i = 0; i < results.length; i++) {
            if (results[i].isColorAvailable === true) {
                const result = await colorCodee(results[i]);
                results[i] = {
                    _id: results[i]._id,
                    categoryName: results[i].categoryName,
                    parentCategoryId: results[i].parentCategoryId,
                    isDeleted: results[i].isDeleted,
                    displayOrder: results[i].displayOrder,
                    isCombinedCategory: results[i].isCombinedCategory,
                    combinedCategoryId: results[i].combinedCategoryId,
                    isColorAvailable: results[i].isColorAvailable,
                    categoryGuid: results[i].categoryGuid,
                    createdOn: results[i].createdOn,
                    updatedOn: results[i].updatedOn,
                    colorCode: result
                }
            } else {
                // console.log("color is false for ", results[i].categoryName);
            }
        }
        res.json({ results })
    } catch (error) {
        console.log(error);
    }
});

router.post("/getsubcategory", async (req, res) => {
    const results = await categorySchema.find({ displayOrder: 2, parentCategoryId: req.body.parentCategoryId })
    res.json({ results })
})

router.get('/getAllResults', async (req, res) => {

    let results = await categorySchema.find({ displayOrder: 1 })
    let newresults = results
    for (let i = 0; i < newresults.length; i++) {
        const { _id, categoryName, parentCategoryId, isDeleted, displayOrder, isCombinedCategory, combinedCategoryId, isColorAvailable, categoryGuid, gblGuid, createdOn, updatedOn } = newresults[i]
        if (newresults[i].isColorAvailable === true) {
            const result = await colorCodee(newresults[i]);
            newresults[i] = {
                _id,
                categoryName,
                parentCategoryId,
                isDeleted,
                displayOrder,
                isCombinedCategory,
                combinedCategoryId,
                isColorAvailable,
                categoryGuid,
                gblGuid,
                createdOn,
                updatedOn,
                colorCode: result
            }
        } else {
            newresults[i] = {
                _id,
                categoryName,
                parentCategoryId,
                isDeleted,
                displayOrder,
                isCombinedCategory,
                combinedCategoryId,
                isColorAvailable,
                categoryGuid,
                gblGuid,
                createdOn,
                updatedOn
            }
        }
    }
    for (let i = 0; i < results.length; i++) {
        const subCategoryRes = await categorySchema.find({ displayOrder: "2", parentCategoryId: results[i]._id.toString() })
        newresults[i] = { ...newresults[i], subCategories: subCategoryRes }
    }

    res.json({ newresults })
});


module.exports = router;