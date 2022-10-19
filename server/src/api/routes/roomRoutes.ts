import express from 'express';
import { createRoom, deleteRoom, getRoomById, getRoomByLink, getRooms } from '../controllers/roomController';

const router = express.Router();

router.route('/')
    .get(getRooms)
    .post(createRoom);

router.get('/by-link/:link', getRoomByLink);

router.route('/:id')
    .get(getRoomById)
    .delete(deleteRoom);

export default router;