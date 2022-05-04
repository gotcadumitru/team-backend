const multer = require("multer");
const File = require("../models/model.file");
const upload = multer({
  storage: multer.memoryStorage(),
});
const { v4: uuidv4 } = require('uuid');

const router = require("express").Router();
const { bucket } = require("../utils/utils.googleDrive");
const bytesToSize = require("../utils/utils.bytesToMb");

router.post("/upload", upload.any("files"), async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).send("Error: No files found");
    } else {
      const files = await Promise.all(

        req.files.map(async (file) => {
          const uploadedFile = await getFile(file)
          return uploadedFile;

        })
      )
      res.status(200).json({
        succes: true,
        files,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: "Something went wrong, hz ce",
    });
  }
});

const getFile = async (file) => {

  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const name = file.originalname.replace(/\s/g, '')
    const blob = bucket.file(id + name);

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      predefinedAcl: "publicRead",
    });

    blobWriter.on("error", (err) => {
      console.log(err);
      reject(err)
    });

    blobWriter.on("finish", async () => {
      const signedUrls = await blob
        .getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        })

      const newFileData = {
        mimetype: file.mimetype,
        name,
        fileUrl: signedUrls[0],
        idFromDrive: id,
        size: bytesToSize(file.size),
        downloadLink: signedUrls[0],
      };

      const newFile = new File(newFileData);
      await newFile.save();
      resolve(newFile)
    });
    blobWriter.end(file.buffer);
  })
}

// router.post("/delete", checkToken, async (req, res) => {
//   try {
//     let { filesIdFromDrive } = req.data;

//     await Promise.all(
//       filesIdFromDrive.map(async (fileIdFromDrive) => {
//         return await deleteFileFromGoogleDriveByFileId(
//           fileIdFromDrive
//         );
//       })
//     );

//     res.status(200).json({
//       succes: true,
//       links: files,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({
//       succes: false,
//       message: "Something went wrong, hz ce",
//     });
//   }
// });
module.exports = router;
