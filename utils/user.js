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

const getUserSmallType = async (user) => {
  const profileImage = await File.findOne({
    idFromDrive: user.profileImage,
  });
  const { password, ...userData } = user._doc;
  return {
    _id: user._id,
    email: userData.email,
    localitate: userData.localitate,
    oras: userData.oras,
    name: userData.name,
    surname: userData.surname,
    profileImage: {
      mimetype: profileImage.mimetype,
      name: profileImage.name,
      _id: profileImage._id,
      size: profileImage.size,
      fileUrl: profileImage.fileUrl,
    },
  };
};

module.exports = { getUserFullType, getUserSmallType };
