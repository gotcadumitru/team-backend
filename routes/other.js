const path = require('path');
const File = require('../models/file.model');
const Other = require('../models/other.model');
const upload = require('../utils/uploadFile');
const router = require('express').Router();
router.get('/', async (req, res) => {
  try {
    const findOther = await Other.find();

    res.status(200).json({
      succes: true,
      other: [...findOther],
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      succes: false,
      message: 'Not authorized',
    });
  }
});

router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const file_path = req.file.path;
      const file_mimetype = req.file.mimetype;
      console.log({
        title,
        description,
        file_path,
        file_mimetype,
      });
      const file = new File({
        title,
        description,
        file_path,
        file_mimetype,
      });
      await file.save();
      res.status(200).json({ succes: true, file_path: path.join(__dirname, '..', file.file_path) });
    } catch (error) {
      console.log(error);
      res.status(400).send('Error while uploading file. Try again later.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  },
);

module.exports = router;
