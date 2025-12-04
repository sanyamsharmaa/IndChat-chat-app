import mongoose from "mongoose";
import chat_module from "../models/chatModal.js"
import user_module from "../models/userModal.js";
import fcmTokenModel from "../models/fcmToken.js";

export const getChats = async (req, res) => {
    try {
        const uid = req.body.id;
        // console.log("userId -", uid)

        const pipeline = [
            { $match: { $or: [{ useraId:  new mongoose.Types.ObjectId(uid) }, { userbId:  new mongoose.Types.ObjectId(uid) }] } },
            // { $match: { userbId: new mongoose.Types.ObjectId(uid) } }

            // determine the "other" participant id
            {
                $addFields: {
                    conversateId: {
                        $cond: [{ $eq: ['$useraId', new mongoose.Types.ObjectId(uid)] }, '$userbId', '$useraId']
                    }
                }
            },

            // // lookup the other user's document
            {
                $lookup: {
                    from: 'users',               // collection name for user model
                    localField: 'conversateId',
                    foreignField: '_id',
                    as: 'conversateDoc'
                }
            },
            // // keep single object (if missing, keep null)
            {
                $addFields: {
                    conversateDoc: { $arrayElemAt: ['$conversateDoc', 0] }
                }
            },

            // // lookup message documents for this chat
            {
                $lookup: {
                    from: 'messages',
                    localField: '_id',
                    foreignField: 'chatId',
                    as: 'msgs'
                }
            },

            // // flatten/concat all msgs[].content into messages array
            {
                $addFields: {
                    messages: {
                        $reduce: {
                            input: '$msgs',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', { $ifNull: ['$$this.content', []] }] }
                        }
                    }
                }
            },

            // // final projection: build conversate object with only _id and name
            {
                $project: {
                    _id: 1,
                    messages: 1,
                    conversate: {
                        $cond: [
                            { $ne: ['$conversateDoc', null] },
                            { id: '$conversateDoc._id', name: '$conversateDoc.name' },
                            null
                        ]
                    }
                }
            }
        ];

        const results = await chat_module.aggregate(pipeline);
        // console.log("caarr", results)
        res.status(200).json({ success: true, data: results })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, msg: "internal server error" })
    }
}

export const findUser = async (req, res) => {

    try {
        const mail = req.body.mail;
        let user = await user_module.find({ mail: mail })

        if (user.length) {
            user = user[0];
            return res.status(200).json({ success: true, data: user });
        }
        res.status(200).json({ success: false, msg: "no user found for given mail" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, msg: "internal server error" })
    }
}

export const storeFCMToken = async (req, res) => {
    try {
        const { userId, token, platform } = req.body;
        
        let existingToken = await fcmTokenModel.findOne({ userId });
        if (existingToken) {
            return res.status(204).json({ success: true, msg: "Token already exists" });
        }
        const newToken = await fcmTokenModel.create({
            userId,
            token,
            platform
        });
        await newToken.save();
        res.status(201).json({ success: true, msg: "Token stored successfully" });
    }

    catch (err) {    
        console.error(err);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }

}


export default { getChats,findUser, storeFCMToken }