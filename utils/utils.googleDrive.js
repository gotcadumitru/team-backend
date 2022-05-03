const admin = require('firebase-admin')

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert('googleservice.json'),
  storageBucket: "gs://team-33e07.appspot.com/"
})

// Cloud storage
const bucket = admin.storage().bucket()
module.exports = { bucket }