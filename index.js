const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors")
const { GridFsStorage } = require("multer-gridfs-storage");
const categoryRoutes = require("./routes/category")
const characterRoutes = require("./routes/character")
const categorySchema = require("./models/category")
const colorSchema = require("./models/categoryColor")

const mongouri = 'mongodb+srv://anitbusinesswebsoft:anitbusinesswebsoft@avatar.kwkzjcs.mongodb.net/';
// const mongouri = 'mongodb://127.0.0.1:27017/AvatarDatabase';
try {
    mongoose.connect(mongouri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
} catch (error) {
    handleError(error);
}
process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

//creating bucket
let bucket;
mongoose.connection.on("connected", () => {
    let db = mongoose.connections[0].db;
    bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: "newBucket"
    });
});

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({
    extended: false
}));
app.use("/category", categoryRoutes)
app.use("/character", characterRoutes)

app.get("/", (req, res) => res.send("data"))


app.get("/fileinfo/:filename", async (req, res) => {
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

const deleteFile = async (filename = null) => {
    if (!filename) {
        console.log("file not exists");
    }
    const cursor1 = await bucket.find({ filename });
    const deData = await bucket.find({ filename }).toArray();
    console.log(deData);
    let fileId;
    for await (const doc1 of cursor1) {
        fileId = doc1._id
    }
    await bucket.delete(fileId)
}

app.delete('/delete/:id', async (req, res) => {
    try {
        const data = await categorySchema.findById(req.params.id)

        if (!data) {
            res.send("Not Found")
            return
        }

        if (!data.categoryGuid || data.categoryGuid === "null") {
            console.log("categoryGuid not ", data.gblGuid);
        } else if (data.categoryGuid && data.categoryGuid !== "null") {
            deleteFile(data.categoryGuid)
        }

        if (!data.gblGuid || data.gblGuid === "null") {
            console.log("gbl not ", data.gblGuid);
        } else if (data.gblGuid && data.gblGuid !== "null") {
            deleteFile(data.gblGuid)
        }

        if (data.isColorAvailable) {
            const newData = await colorSchema.findOneAndRemove({ categoryId: data._id })
            console.log("co", newData);
        }
        const deletedCategory = await categorySchema.findByIdAndRemove(req.params.id)
        res.json({ data: deletedCategory })

    } catch (error) {
        console.log("error is ", error);
    }
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Application live on localhost`, PORT);
});