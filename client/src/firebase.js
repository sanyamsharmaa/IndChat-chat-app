// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported  } from 'firebase/messaging';

// console.log("firebase env vars", import.meta.env.VITE_FIREBASE_API_KEY)
// console.log("projectId", import.meta.env.VITE_FIREBASE_PROJECT_ID)

const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
  apiKey: "AIzaSyAaycqKdusFRRSBJnfYbMsyT47ZDy35XtM",
  authDomain: "indchat-88.firebaseapp.com",
  projectId: "indchat-88",
  messagingSenderId: "indchat-88.firebasestorage.app",
  appId: "1:222093681928:web:7ca66bc847f84a80acf8bd",
   measurementId: "G-71DTTJGEEZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// console.log("Initialized firebase app", app)
const messaging = getMessaging(app);
// let messaging = null;

// (async () => {
//   if (await isSupported()) {
//     messaging = getMessaging(app);
//     // set up onMessage, getToken, etc.
//   } else {
//     console.warn("Firebase messaging is not supported in this browser/context");
//   }
// })();

// async function printToken() {
//   await navigator.serviceWorker.register('/firebase-messaging-sw.js');
//   const vapidKey = "BC61oyGYhXWWONN_F09O2Vlsh5bK4YJc4cTkEjDDgB6fhVYyaVLbCzGGms2W6JadeGcGi_eXhpWUT-zSxz19GBs";
//   const token = await getToken(messaging, { vapidKey });
//   console.log('FCM token (paste into DB):', token);
// }
// printToken();

export { messaging, getToken, onMessage };
