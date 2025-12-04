// get-chats

import { Router } from 'express';
import {getChats, findUser,storeFCMToken} from '../controllers/controllers.js'
const routes = new Router();

//get routes

routes.post("/get-chats", getChats)
routes.post("/find-user", findUser)
routes.post("/store-fcm-token", storeFCMToken)
// routes.post("/add-user", addNewUser)
// routes.post("/use-streak", useStreak)

export default routes

