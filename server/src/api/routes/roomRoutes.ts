import express from 'express';
import {
    createRoom,
    deleteRoom,
    getRoomById,
    getRoomByLink,
    getRooms,
    updateRoom
} from '../controllers/roomController';
import { auth } from '../middlewares/authentication';

const router = express.Router();

router.route('/')
    .get(auth, getRooms)
    .post(auth, createRoom);

router.get('/by-link/:link', getRoomByLink);

router.route('/:id')
    .get(auth, getRoomById)
    .delete(auth, deleteRoom)
    .patch(auth, updateRoom);

export default router;