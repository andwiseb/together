import express from 'express';
import { createUser, deleteUser, getUserByIdHandler, getUsers, updateUser } from '../controllers/userController';

const router = express.Router();

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserByIdHandler)
    .delete(deleteUser)
    .patch(updateUser);

export default router;