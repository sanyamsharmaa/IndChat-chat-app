import mongoose from 'mongoose';

const url = process.env.MONGO_URL;
// console.log("mongo url-", url)
async function ConnectMongodb() {
    try {
        await mongoose.connect(url)
        console.log("Mongodb connect successfully!")
    }
    catch (err) {
        console.log("error in connect with database -", err)
    }
}

export default ConnectMongodb