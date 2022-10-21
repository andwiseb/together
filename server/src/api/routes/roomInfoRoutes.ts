import express from 'express';
import {
    createRoomInfo,
    deleteRoomInfo,
    getRoomInfoById,
    getRoomsInfo,
    updateRoomInfoHandler
} from '../controllers/roomInfoController';

const router = express.Router();

router.route('/')
    .get(getRoomsInfo)
    .post(createRoomInfo);


router.route('/:id')
    .get(getRoomInfoById)
    .delete(deleteRoomInfo)
    .patch(updateRoomInfoHandler);

export default router;