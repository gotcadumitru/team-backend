const {
    Schema,
    model
} = require("mongoose");


const OtherSchema = new Schema({
    name: String,

}, {
    timestamps: true,
});

const Other = model('Other', OtherSchema);

module.exports = Other;