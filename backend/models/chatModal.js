import mongoose from 'mongoose'


const schema = new mongoose.Schema({
    useraId: {
        type: mongoose.Types.ObjectId,
        required:true
    },
    userbId: {
        type: mongoose.Types.ObjectId,
        required:true
    }, 

})

const chat_module = mongoose.model('chat', schema)

export default chat_module;