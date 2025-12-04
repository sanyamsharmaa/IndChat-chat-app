
import mongoose from 'mongoose'

const Msgschema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    text: {
        type: String,   
        required: true
    },
    status :{
        type : String,
        enum: ['sent','seen','delivered'],
        default: 'sent'
    }
},
    { timestamps: true })


const schema = new mongoose.Schema({
    chatId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    content: {
        type: [Msgschema],
        required: true
    },

})

const msg_module = mongoose.model('message', schema)
export default msg_module;


// db.messages.updateOne(
//   { _id: ObjectId("69243a7f82e7966a34e3c8ab") },
//   [
//     {
//       $set: {
//         content: {
//           $slice: [
//             "$content",
//             { $subtract: [ { $size: "$content" },  ] }
//           ]
//         }
//       }
//     }
//   ]
// );