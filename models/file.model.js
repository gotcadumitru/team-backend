const { Schema, model } = require('mongoose');

const FileSchema = new Schema(
  {
    name: { type: String, required: true },
    idFromDrive: { type: String, required: true },
    mimetype: { type: String, required: true },
    imageUrl: { type: String, required: true },
    downloadLink: { type: String, required: true },
    size: { type: Number, required: true },
  },
  {
    timestamps: true,
    id: true,
  },
);

const File = model('File', FileSchema);

module.exports = File;
