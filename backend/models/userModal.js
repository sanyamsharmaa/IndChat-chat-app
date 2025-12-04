import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    mail: {
        type: String,
        required:true
    },

})

const user_module = mongoose.model('user', schema)

export default user_module;