import express from 'express';
import {
    createRoomInfo,
    deleteRoomInfo,
    getRoomInfoById,
    getRoomsInfo,
    updateRoomInfoHandler
} from '../controllers/roomInfoController';
import { auth } from '../middlewares/authentication';

const router = express.Router();

router.route('/')
    .get(auth, getRoomsInfo)
    .post(auth, createRoomInfo);


router.route('/:id')
    .get(auth, getRoomInfoById)
    .delete(auth, deleteRoomInfo)
    .patch(auth, updateRoomInfoHandler);

export default router;