import { prisma } from '../../db-connection';
import { Request, Response } from 'express';

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany();
        const roomsCount = await prisma.room.count();
        res.json({ data: rooms, count: roomsCount });
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getRoomById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const room = await prisma.room.findUnique({ where: { id }, include: { roomInfo: true } });
        if (!room) {
            return res.status(404).json({ message: "Room not found!" });
        }
        res.json(room);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const getRoomByLink = async (req: Request, res: Response) => {
    const { link } = req.params;
    try {
        const room = await prisma.room.findUnique({ where: { link }, include: { roomInfo: true } });
        if (!room) {
            return res.status(404).json({ message: "Room not found!" });
        }
        res.json(room);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const createRoom = async (req: Request, res: Response) => {
    const { mediaUrl } = req.body;
    try {
        const user = req['user'];
        if (!user) {
            return res.status(403).json({ message: "Not authorized to execute this process." })
        }
        if (!mediaUrl) {
            return res.status(400).json({ message: "medial url is required." })
        }
        const room = await prisma.room.create({ data: { mediaUrl: mediaUrl, userId: user } });
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const deleteRoom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const room = await prisma.room.delete({ where: { id } });
        res.json(room);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const updateRoom = async  (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const room = await prisma.room.update({ where: { id }, data: req.body });
        res.json(room);
    } catch (error) {
        res.status(400).json(error);
    }
}