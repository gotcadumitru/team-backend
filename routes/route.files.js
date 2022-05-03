const checkToken = require("./verifyToken");
// const File = require("../models/model.file");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
});

const router = require("express").Router();
const { bucket } = require("../utils/utils.googleDrive");

router.post("/upload", upload.any("files"), async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).send("Error: No files found");
    } else {
      req.files.map(async (file) => {
        const blob = bucket.file(file.originalname);

        const blobWriter = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
          predefinedAcl: "publicRead",
        });

        blobWriter.on("error", (err) => {
          console.log(err);
        });

        blobWriter.on("finish", () => {
          blob
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((signedUrls) => {
              console.log(signedUrls[0]);
            });
          res.status(200).send("File uploaded.");
        });

        blobWriter.end(file.buffer);
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
