import admin from './firebaseAdmin.js';
import { set } from 'mongoose';

const sentToToken = async ( userId, token, title, body, data = {}) => {
    // console.log("sending to token-", userId, token, title, body, data)
    try {
        const message = {
            // userId,
            token,  // assuming one user has logged in single device otherview we were sending to array of tokens
            data,
            notification: {
                title,
                body
            },  
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    title,
                    body,
                    requireInteraction: 'true',
                    icon: 'https://res.cloudinary.com/dwhp05lqs/image/upload/v1764242078/fsfs_uwh7wk.png',
                    vibrate: [100, 50, 100],
                    tag: data.tag || 'default-tag',
                    actions: [
                        {
                            action: 'open',
                            title: 'View Chat'
                        }
                    ],
                    data: {
                        url: 'http://localhost:5173/chat/'
                    }

                }

            }

        }
        return await admin.messaging().send(message);
    }
    catch (err) {
        console.error('Error sending notification to token:', err);
        throw err;
    }
}


export default sentToToken;