const firebaseAdmin = require('firebase-admin')

// Initialize firebase admin SDK
const firebasePushNotificationsAdmin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(JSON.parse(process.env.FIREBASE_PUSH_NOTIFICATIONS_SERVICE_ACCOUNT)),
},"FIREBASE_PUSH_NOTIFICATIONS_SERVICE_ACCOUNT")
module.exports = {firebasePushNotificationsAdmin}
