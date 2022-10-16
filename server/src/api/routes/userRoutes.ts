import express from 'express';
import { createUser, deleteUser, getUserById, getUsers } from '../controllers/userController';

const router = express.Router();

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserById)
    .delete(deleteUser);

export default router;