const { google } = require('googleapis');
const bytesToSize = require('./utils.bytesToMb');
const { Readable } = require('stream');
const KEY_FILE_PATH = 'googleservice.json';

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: process.env.GOOGLE_DRIVE_SCOPE,
});

const MIME_TYPES = {
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
};
const driveService = google.drive({ version: 'v3', auth });

function bufferToStream(binary) {

  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    }
  });

  return readableInstanceStream;
}
const createAndUploadFile = async ({ mimetype, name, data }) => {
  const fileMetaData = {
    name,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };
  const media = {
    mimeType: mimetype,
    body: bufferToStream(data),
  };

  try {
    const response = await driveService.files.create({
      media,
      resource: fileMetaData,
      fields: 'id, webViewLink, webContentLink, size',
    });
    const fileObject = {
      fileUrl: 'https://drive.google.com/uc?export=view&id=' + response.data.id,
      idFromDrive: response.data.id,
      downloadLink: response.data.webContentLink,
      size: bytesToSize(+response.data.size),
    };
    return fileObject;
  } catch (err) {
    console.log(err);
  }
};

async function deleteFileFromGoogleDriveByFileId(fileId) {
  try {
    const result = await driveService.files.delete({
      fileId,
    });
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
      fields: 'webViewLink, webContentLink, size',
    });
    return { downloadLink: result.data.webContentLink, size: +result.data.size };
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

module.exports = { createAndUploadFile, createFolder, deleteFileFromGoogleDriveByFileId, auth, MIME_TYPES };