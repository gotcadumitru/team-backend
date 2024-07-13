const firebasePushNotificationsAdmin = require('firebase-admin')

// Initialize firebase admin SDK
firebasePushNotificationsAdmin.initializeApp({
  credential: firebasePushNotificationsAdmin.credential.cert(JSON.parse(process.env.FIREBASE_PUSH_NOTIFICATIONS_SERVICE_ACCOUNT)),
},"FIREBASE_PUSH_NOTIFICATIONS_SERVICE_ACCOUNT")
module.exports = {firebasePushNotificationsAdmin}
