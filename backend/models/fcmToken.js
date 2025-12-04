// models/Device.js
import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  token: {type: String, required: true, index: true},
  platform: {type: String},
  createdAt: {type: Date, default: Date.now}
});

const modal =  mongoose.model('fcmtoken', DeviceSchema);
export default modal;
