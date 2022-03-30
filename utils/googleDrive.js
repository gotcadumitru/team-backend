const { google } = require('googleapis');
const fs = require('fs');

const KEY_FILE_PATH = 'googleservice.json';

const SKOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = '1Qd9LE1ffuCr8_HvxoH6uY8Jek7POUr_j';

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SKOPES,
});
const MIME_TYPES = {
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
};
const driveService = google.drive({ version: 'v3', auth });

const createAndUploadFile = async (name, mimeType, path) => {
  const fileMetaData = {
    name,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(path),
  };

  try {
    const response = await driveService.files.create({
      media,
      resource: fileMetaData,
      fields: 'id',
    });
    const imageObject = {
      imageUrl: 'https://drive.google.com/uc?export=view&id=' + response.data.id,
      idFromDrive: response.data.id,
    };
    return imageObject;
  } catch (err) {
    console.log(err);
  }
};

async function deleteFileFromGoogleDriveByFileId(fileId) {
  try {
    const result = await driveService.files.delete({
      fileId,
    });
    console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}

async function generatePublicUrl(fileId) {
  try {
    await driveService.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    const result = await driveService.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}

const createFolder = (name) => {
  var fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  driveService.files.create(
    {
      resource: fileMetadata,
      fields: 'id',
    },
    function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.id);
      }
    },
  );
};
module.exports = { createAndUploadFile, createFolder, generatePublicUrl, deleteFileFromGoogleDriveByFileId, auth, MIME_TYPES };
