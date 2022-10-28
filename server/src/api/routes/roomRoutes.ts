import express from 'express';
import {
    createRoom,
    deleteRoom,
    getRoomByIdHandler,
    getRoomByLink,
    getRooms,
    updateRoomHandler
} from '../controllers/roomController';
import { auth } from '../middlewares/authentication';

const router = express.Router();

router.route('/')
    .get(auth, getRooms)
    .post(auth, createRoom);

router.get('/by-link/:link', getRoomByLink);

router.route('/:id')
    .get(auth, getRoomByIdHandler)
    .delete(auth, deleteRoom)
    .patch(auth, updateRoomHandler);

export default router;