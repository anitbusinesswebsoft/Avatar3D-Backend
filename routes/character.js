const express = require('express');
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const characterSchema = require("../models/character")
const colorSchema = require("../models/categoryColor")
const { characterStorage } = require("../functions/uploadfile")

let bucket;
mongoose.connection.on("connected", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connections[0].db, {
        bucketName: "characterBucket"
    });
});

const upload = multer({
    storage: characterStorage
});

router.post("/create", upload.fields([{ name: 'glbfile' }, { name: 'iconfile' }]), async (req, res) => {
    try {
        console.log("body create-- ", req.files);
        const { characterName, characterType } = req.body
        let { glbfile, iconfile } = req.files
        const newCharacter = new characterSchema({
            characterName,
            characterType,
            characterGuid: Array.isArray(iconfile) ? iconfile[0].filename : null,
            gblGuid: Array.isArray(glbfile) ? glbfile[0].filename : null
        })
        const characterFile = await newCharacter.save()
        res.status(201).json(characterFile)
    } catch (error) {
        console.log("error ", error);
        res.status(500).json({ error })
    }
})

router.post("/", async (req, res) => {
    let data
    if (req.body.characterType === "all") {
        data = await characterSchema.find()
        res.status(200).json({ data })
        return
    }
    data = await characterSchema.find({ characterType: req.body.characterType })
    res.status(200).json({ data })
})

router.get("/fileinfo/:filename", async (req, res) => {
    try {
        const file = await bucket.find({
            filename: req.params.filename
        })

        if (!file) {
            return res.status(404).json({
                err: "no files exist"
            });
        }

        bucket.openDownloadStreamByName(req.params.filename).pipe(res);
    } catch (error) {
        console.log("Error ", error);
        res.send("some Error")
    }
});

module.exports = router;