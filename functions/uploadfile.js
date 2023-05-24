const { GridFsStorage } = require("multer-gridfs-storage");
// const mongouri = 'mongodb://127.0.0.1:27017/AvatarDatabase';
const mongouri = 'mongodb+srv://anitbusinesswebsoft:anitbusinesswebsoft@avatar.kwkzjcs.mongodb.net/';


const storage = new GridFsStorage({
    url: mongouri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
            }
            const filename = file.originalname;
            const fileInfo = {
                filename: Date.now() + filename,
                bucketName: "newBucket"
            };
            resolve(fileInfo);
        });
    }
}); 

const characterStorage = new GridFsStorage({
    url: mongouri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
            }
            const filename = file.originalname;
            const fileInfo = {
                filename: Date.now() + filename,
                bucketName: "characterBucket"
            };
            resolve(fileInfo);
        });
    }
});


module.exports= {storage, characterStorage}
