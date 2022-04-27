const File = require('../models/model.file');
const User = require('../models/model.user');
const { getUserSmallType } = require('./utils.user');

const getPostFullType = async (post, users = {}) => {
    let postFullType = {
        ...post
    }
    postFullType.files = await File.find({
        idFromDrive: { $in: post.files },
    });
    if (users[post.author]) {
        postFullType.author = users[post.author];
    } else {

        postFullType.author = await getUserSmallType(await User.findById(post.author));
    }

    return postFullType
};

module.exports = { getPostFullType };
