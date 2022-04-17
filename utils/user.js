const File = require('../models/file.model');

const getUserFullType = async (user) => {
  const domiciliuFiles = await File.find({
    idFromDrive: { $in: user.domiciliuFiles },
  });
  const profileImage = await File.findOne({
    idFromDrive: user.profileImage,
  });
  const { password, ...userData } = user._doc;
  return {
    id: user._id,
    ...userData,
    domiciliuFiles,
    profileImage,
  };
};

module.exports = { getUserFullType };
