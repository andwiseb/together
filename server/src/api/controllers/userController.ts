import { prisma } from '../../db-connection';
import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        const usersCount = await prisma.user.count();
        res.json({ data: users, count: usersCount });
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
}

export const getUserByIdHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const createUser = async (req: Request, res: Response) => {
    const { username } = req.body;
    try {
        if (!username) {
            return res.status(400).json({ message: "Username is required." })
        }
        const user = await prisma.user.create({ data: { username } });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.delete({ where: { id } });
        res.json(user);
    } catch (error) {
        res.status(400).json(error);
    }
}