const { Schema, model } = require('mongoose');

const OtherSchema = new Schema(
  {
    name: {},
  },
  {
    timestamps: true,
    _id: true,
  },
);

const Other = model('Other', OtherSchema);

module.exports = Other;
