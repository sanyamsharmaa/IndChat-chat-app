// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import instance from './utils/Instance.js';
// import { initializeApp } from "firebase/app";
import { messaging, getToken, onMessage } from './firebase.js';


// const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY; // public VAPID key
// const vapidKey = "BI00zkGZVJ1BgC4v9Bj8etmJ7PNFCWiTYCYTALf32JWSVsrknCwpMS4E4HG1fp3g322Yk2oS3dkPSE9y919WB58"; // public VAPID key
const vapidKey = "BC61oyGYhXWWONN_F09O2Vlsh5bK4YJc4cTkEjDDgB6fhVYyaVLbCzGGms2W6JadeGcGi_eXhpWUT-zSxz19GBs"

function getUserData() {
  const value = document.cookie
    .split("; ")
    .find(row => row.startsWith("user="))
    ?.split("=")[1];

  // const data = "qqqqqqqqqqqqqqqq" 
  const data = JSON.parse(decodeURIComponent(value)) 
  return data;
}


async function initFCM() {
  try {
    // 1) register service worker (root path)
    // const registration = await navigator.serviceWorker.register('http://localhost:5173/firebase-messaging-sw.js', { type: 'module' });
    // let registration;
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg =>{return reg})
      .catch(err => console.error('FCM init failed:', err));
    }
    // 2) request permission
    const permission = await Notification.requestPermission();
    // console.log('Notification permission status:', permission);
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }

    // 3) get token
    console.log("get token with registration",vapidKey)
    // const app = initializeApp(firebaseConfig);
    console.log("Messaging", messaging)
    // const currentToken = "c6f58c37f4c2c1d1b9a7d8a4f73cf83a8c1b1b8d9d4e39fdfaa8249e9f3a9d9b"
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      console.log('FCM token:', currentToken);
      // const userId = "691c3a51667a398e5b55eeec"  // ww
      // const userId = "691c3a7b667a398e5b55eeed"  // jesse
      const userId ="69284e6d297d820fa33eeece" //hank
      console.log("userId", userId)
      // Send token to your Express backend to save in MongoDB:getUserData().id
      await instance.post('/store-fcm-token', { userId , token: currentToken, platform: 'web' })
    }
     else {
      console.log('No registration token available. Request permission to generate one.');
    }


    // 4) foreground message handler
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      // Show a UI notification (e.g., use Notification API)
      new Notification(payload.notification?.title || 'New message', {
        body: payload.notification?.body || JSON.stringify(payload.data || {}),
      });
    });
  } catch (err) {
    console.error('FCM init failed:', err);
  }
}

initFCM();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
