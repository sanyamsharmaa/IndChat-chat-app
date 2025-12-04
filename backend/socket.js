import { Socket } from "socket.io";
import msg_module from "./models/msgModal.js";
import chat_module from "./models/chatModal.js";
import mongoose from "mongoose";
import cookie from 'cookie';
import sentToToken from "./services/sendToToken.js";
import fcmTokenModel from "./models/fcmToken.js"
import user_module from "./models/userModal.js";
const onlineUsers = new Map(); // mapping for users and sockets


// handling for multiple sessions for single user
// function addUserSocket(userId, socketId) {
//   if (!onlineUsers.has(userId)) {
//     onlineUsers.set(userId, new Set());
//   }
//   onlineUsers.get(userId).add(socketId);
// }

// function removeUserSocket(userId, socketId) {
//   if (!onlineUsers.has(userId)) return;

//   const set = onlineUsers.get(userId);
//   set.delete(socketId);

//   if (set.size === 0) {
//     onlineUsers.delete(userId);
//   }
// }

// function getSocketsForUser(userId) {
//   const set = onlineUsers.get(userId);
//   return set ? [...set] : [];
// }


function socketHandler(io) {

    io.use((socket, next) => {
        try {
            // The handshake headers contain cookies as a string
            const cookieHeader = socket.handshake.headers?.cookie || '';
            const cookies = cookie.parse(cookieHeader || '');
            const user = cookies?.user; // token comes from res.cookie('token', ...)

            if (!user) {
                // console.log("cookie header-", socket.handshake.headers?.cookie)
                return next(new Error('Authentication error: missing user in cookie'));
            }

            // attach minimal safe info
            //   socket.user = { id: payload.id, email: payload.email };
            //   socket.userId = payload.id;
            socket.user = user;
            return next();

        } catch (err) {
            console.error('socket auth error', err.message);
            return next(new Error('Authentication error'));
        }
    });

    io.on("connection", (socket) => {

        const value = socket.handshake.headers.cookie
            .split("; ")
            .find(row => row.startsWith("user="))
            ?.split("=")[1]
        const userId = JSON.parse(decodeURIComponent(value)).id
        // socket.handshake.headers.cookie?.id;

        // addUserSocket(userId, socket.id);
        onlineUsers.set(userId, socket.id);

        socket.on("disconnect", () => {
            //   removeUserSocket(userId, socket.id);
            onlineUsers.delete(userId);
        });


        socket.on('open_chat', async ({ aId, bId }) => {  // optimisation - open_chat will get chatId directly and for new_chat_open - aid and bid provided
            console.log("aId, bId", aId, bId)
            let chat1 = await chat_module.find({ useraId: aId, userbId: bId })
            let chat2 = await chat_module.find({ useraId: bId, userbId: aId })
            const l1 = chat1.length;
            const l2 = chat2.length;
            let isExist = (l1 || l2)

            if (isExist) {
                const chat = l1 ? chat1[0] : chat2[0];
                console.log("chat exist -", chat)
                const msg = await msg_module.find({ chatId: chat.id });
                console.log("founded msg content-", msg);
                if (msg.length) {
                    msg[0]?.content?.forEach(m => {

                        console.log("status updated for muid-", m.userId, (m.userId.equals(bId)))
                        if (m.userId.equals(bId)) {
                            m.status = "seen"
                        }
                    });
                    await msg[0].save();
                }
                socket.emit('chat_opened', { chatId: chat.id })
                console.log("chat opened id :", chat.id)
            }

            // console.log("SOCKET-", socket?.handshake)
            // if (chat.length) {
            //     chat = chat[0];
            //     const msg = await msg_module.find({chatId:chat.id});
            //     console.log("founded msg-", msg)
            //     msg.content.forEach(m => {
            //         if(m.userId==bId){
            //             m.status = "seen"
            //         }
            //     });
            //     await msg.save();
            //     socket.emit('chat_opened', { chatId: chat.id })
            //     console.log("chat opened id :", chat[0].id)
            // }
            else {
                const chat = await chat_module.create({
                    useraId: aId,
                    userbId: bId

                })
                socket.emit('new_chat_opened', { chatId: chat.id })
                console.log("new chat created")
            }
        })

        socket.on("send_message", async ({ myId, cnvstId, cId, text }) => {//useraId, userbId, chatId, message 
            console.log("req data", myId, cnvstId, cId, text)

            let isMsgExist = await msg_module.find({ chatId: cId });
            let msg;
            // console.log("Socket-", socket)
            console.log("Online users-", onlineUsers)
            // console.log("search result-", isMsgExist)
            if (isMsgExist.length) {
                //if already chatted
                msg = isMsgExist[0];
                console.log("Appending message-")
                // let msgArr = [...msg.content, {userId: mongoose.Types.ObjectId(useraId), text : message }];
                let newCtnt = { userId: new mongoose.Types.ObjectId(myId), text: text, status: 'sent' };
                // console.log("new content - ", newCtnt)
                msg.content.push(newCtnt);
                await msg.save();
                // msg_module.updateOne({ chatId: chatId }, { $set: { content: msgArr } })
            }
            else {
                // if first chat
                console.log("Creating new message-")
                msg = await msg_module.create({
                    chatId: new mongoose.Types.ObjectId(cId),
                    content: [{
                        userId: new mongoose.Types.ObjectId(myId),
                        text: text
                        // status is sent - default
                    }]
                })
            }
            const lastIndex = msg.content.length - 1;

            socket.emit('message_status_update', { chatId: cId, msgId: msg.content[lastIndex]._id, status: 'sent' });

            // const recipientSockets = getSocketsForUser(userbId); // for multiple sessions of users
            // if (recipientSockets && recipientSockets.length > 0) {
            //     recipientSockets.forEach(sid => {
            //         sid.io.emit('message_received', { message })
            //     });
            // }
            const recipientSocketId = onlineUsers.get(cnvstId);
            // console.log("recipientSocketId-",recipientSocketId)
            if (recipientSocketId) {
                // console.log("sending message-")
                io.to(recipientSocketId).emit('message_received', {
                    chatId: cId,
                    message: {
                        _id: msg.content[lastIndex]._id,
                        userId: myId,
                        text,
                        // status : 'seen',
                    }

                })
                // msg.content[lastIndex].status = 'seen';  
                // await msg.save();
                // socket.emit('message_status_update', { chatId : cId, msgId : msg.content[lastIndex]._id, status : 'seen' })  
            }
            // else{
                console.log("myId", myId)
                const user = await user_module.findById(myId);
                const fcmToken = await fcmTokenModel.find({ userId: cnvstId }); 
                if(!fcmToken.length){    
                    console.log("No FCM token found for user:", cnvstId);
                    return;
                }   
                console.log("fcmToken-", fcmToken[0])
                
                const resp = await sentToToken(fcmToken[0].userId, fcmToken[0].token, user.name, text, { chatId: cId, senderId: myId });


                if(!resp.success){
                    // console.error('Failed to send FCM notification', resp);  
                    if(resp?.err?.code==='registration-token-not-registered'){
                        fcmTokenModel.deleteOne({userId: cnvstId, token: fcmToken[0].token});
                    }
                }

            // }
        })

        // socket.on('message_read', async (userId, chatId) => {// will be triggered from frontend, handled at self
        //     const message = await msg_module.find({
        //         userId: { $ne: useraId }, // only find those which didn't send by self
        //         chatId: chatId,
        //     })
        //     let ctntArr = message.map(msg => {
        //         if (msg.status == 'sent') {
        //             msg.status == 'read'
        //         }
        //         return msg;
        //     })

        //     message.content = ctntArr;
        //     message.save();

        //     socket.emit('message_status_update', { message }) // to sender -  display updated content

        // })
        socket.on('message_seen', async ({ chatId, userId }) => {
            console.log("message_seen-", chatId, userId)
            const msg = await msg_module.find({ chatId: chatId })
            const lastIndex = msg?.content?.length - 1;
            if (lastIndex >= 0) {
                msg[0].content[lastIndex].status = 'seen';
                await msg[0].save();
            }

            const recipientSocketId = onlineUsers.get(userId);
            // console.log("recipientSocketId-",recipientSocketId) 
            if (recipientSocketId) {
                // console.log("sending message-")
                io.to(recipientSocketId).emit('message_status_update', { chatId: chatId, msgId: msg[0].content[lastIndex]?._id, status: 'seen' })
            }

        });

    });
}

export default socketHandler