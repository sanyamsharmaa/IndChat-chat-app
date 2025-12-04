// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
// apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);
// const messaging = getMessaging(app);

// export { messaging, getToken, onMessage };



// public/firebase-messaging-sw.js
// use compat build via CDN — no ES imports
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// configure with literal values (can't use import.meta.env here if file is in public)
const firebaseConfig = {
  apiKey: "AIzaSyAaycqKdusFRRSBJnfYbMsyT47ZDy35XtM",
  authDomain: "indchat-88.firebaseapp.com",
  projectId: "indchat-88",
  messagingSenderId: "indchat-88.firebasestorage.app",
  appId: "1:222093681928:web:7ca66bc847f84a80acf8bd",
   measurementId: "G-71DTTJGEEZ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // show notification
  // console.log("Received background message ", payload);
  const { title, ...options } = payload.notification || {};
  self.registration.showNotification(title || 'New message', options);
});


self.addEventListener('notificationclose', function(event) {
  alert('On notification closed');
  // Perform some action when the notification is closed
});


self.addEventListener('notificationclick', function(event) {
  altert('On notification click: ', event);
  event.notification.close(); // close it immediately

  const clickAction = event.action; // 'open', 'dismiss', '' (empty) if main body clicked
  const payload = event.notification.data || {};
  const urlToOpen = payload.url || '/';

  // prefer focusing an existing window/tab for same origin
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Try to find an already-open client (tab)
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // adjust this test depending on your app's URL structure
        if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname) && 'focus' in client) {
          return client.focus();
        }
      }
      // otherwise open a new window/tab
      if (clients.openWindow) {
        // if user clicked action 'open' or clicked body (clickAction === '')
        if (clickAction === 'open' || clickAction === '') {
          return clients.openWindow(urlToOpen);
        } else {
          // dismiss or other actions: no open
          return Promise.resolve();
        }
      }
    })
  );
});