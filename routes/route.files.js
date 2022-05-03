const checkToken = require("./verifyToken");
const File = require("../models/model.file");
const router = require("express").Router();
const {
  createAndUploadFile,
  deleteFileFromGoogleDriveByFileId,
} = require("../utils/utils.googleDrive");
const sharp = require('sharp')
router.post("/upload", async (req, res) => {
  try {
    let files = req.files?.files ?? [];
    if (!Array.isArray(files)) {
      files = [files];
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const { fileUrl, idFromDrive, size, downloadLink } = await createAndUploadFile(file);
        let fileResized = null
        let imageLowQuality = null
        if (["image/jpeg", "image/png", 'application/octet-stream'].includes(file.mimetype)) {
          fileResized = await sharp(file.data).resize({ width: 200, }).toBuffer()
          imageLowQuality = await createAndUploadFile({ name: file.name, mimetype: file.mimetype, data: fileResized });
        }
        const newFileData = {
          mimetype: file.mimetype,
          name: file.name,
          fileUrl,
          idFromDrive,
          size,
          downloadLink,
          lowQualityUrl: imageLowQuality?.fileUrl || fileUrl,
        };

        const newFile = new File(newFileData);
        await newFile.save();
        return newFileData;
      })
    );

    res.status(200).json({
      succes: true,
      files: uploadedFiles,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: "Something went wrong, hz ce",
    });
  }
});

router.post("/delete", checkToken, async (req, res) => {
  try {
    let { filesIdFromDrive } = req.data;

    await Promise.all(
      filesIdFromDrive.map(async (fileIdFromDrive) => {
        return await deleteFileFromGoogleDriveByFileId(
          fileIdFromDrive
        );
      })
    );

    res.status(200).json({
      succes: true,
      links: files,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: "Something went wrong, hz ce",
    });
  }
});
module.exports = router;
