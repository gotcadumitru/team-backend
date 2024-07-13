const admin = require('firebase-admin')

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  storageBucket: "gs://file-storage-8a30e.appspot.com/"
},)
// Cloud storage
const bucket = admin.storage().bucket()
module.exports = { bucket }
