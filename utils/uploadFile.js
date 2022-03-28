const fetch = require('node-fetch');

const uploadImage = async (image, name) => {
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?name=${name}&key=${process.env.IMGG_SECRET}`, {
      method: 'POST',
      body: image,
    });
    console.log(response);
    return response.data.url;
  } catch (err) {
    console.log(err);
    return null;
  }
};
module.exports = uploadImage;
