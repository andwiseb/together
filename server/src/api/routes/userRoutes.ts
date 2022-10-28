import express from 'express';
import { createUser, deleteUser, getUserByIdHandler, getUsers } from '../controllers/userController';

const router = express.Router();

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserByIdHandler)
    .delete(deleteUser);

export default router;