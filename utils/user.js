const File = require('../models/file.model');

const getUserFullType = async (user) => {
  const domiciliuFiles = await File.find({
    idFromDrive: { $in: user.domiciliuFiles },
  });
  const profileImage = await File.findOne({
    idFromDrive: user.profileImage,
  });
  return {
    id: user._id,
    ...user._doc,
    domiciliuFiles,
    profileImage,
  };
};

module.exports = { getUserFullType };
