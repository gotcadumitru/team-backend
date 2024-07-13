const firebaseAdmin = require('firebase-admin')

// Initialize firebase admin SDK
const adminApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  storageBucket: "gs://file-storage-8a30e.appspot.com/"
},)
// Cloud storage
const bucket = adminApp.storage().bucket()
module.exports = { bucket }
