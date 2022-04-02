const checkToken = require('./verifyToken');
const File = require('../models/file.model');
// const fs = require('fs');
const router = require('express').Router();
const { createAndUploadFile, deleteFileFromGoogleDriveByFileId } = require('../utils/googleDrive');

router.post('/upload', async (req, res) => {
  try {
    let files = req.files?.files ?? [];
    if (!Array.isArray(files)) {
      files = [files];
    }

    const images = await Promise.all(
      files.map(async (file) => {
        const path = './uploads/' + new Date().getTime() + Math.random() + file.name;
        await file.mv(path);
        const { imageUrl, idFromDrive, size, downloadLink } = await createAndUploadFile(file.name, file.mimetype, path);
        const newFileData = {
          mimetype: file.mimetype,
          name: file.name,
          imageUrl,
          idFromDrive,
          size,
          downloadLink,
        };

        const newFile = new File(newFileData);
        await newFile.save();
        // fs.unlinkSync(path);
        return newFileData;
      }),
    );

    res.status(200).json({
      succes: true,
      files: images,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});

router.post('/delete', checkToken, async (req, res) => {
  try {
    let { filesIdFromDrive } = req.data;

    await Promise.all(
      filesIdFromDrive.map(async (fileIdFromDrive) => {
        return await deleteFileFromGoogleDriveByFileId(fileIdFromDrive);
      }),
    );

    res.status(200).json({
      succes: true,
      links: images,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      succes: false,
      message: 'Something went wrong, hz ce',
    });
  }
});
module.exports = router;
