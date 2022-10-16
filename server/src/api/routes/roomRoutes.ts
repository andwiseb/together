import express from 'express';
import { createRoom, deleteRoom, getRoomById, getRooms } from '../controllers/roomController';

const router = express.Router();

router.route('/')
    .get(getRooms)
    .post(createRoom);

router.route('/:id')
    .get(getRoomById)
    .delete(deleteRoom);

export default router;