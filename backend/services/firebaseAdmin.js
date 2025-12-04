// firebaseAdmin.js
import admin from 'firebase-admin';
import fs from 'fs';
// import serviceAccount from './serviceAccountKey.json' assert { type: "json" };

const serviceAccount = JSON.parse(
  fs.readFileSync("services/serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;  