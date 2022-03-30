const { Schema, model } = require('mongoose');

const FileSchema = new Schema(
  {
    name: { type: String, required: true },
    idFromDrive: { type: String, required: true },
    mimetype: { type: String, required: true },
  },
  {
    timestamps: true,
    id: true,
  },
);

const File = model('File', FileSchema);

module.exports = File;
