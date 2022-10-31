import { prisma } from '../../db-connection';
import { Request, Response } from 'express';
import { Room } from '@prisma/client';

export const getRoomsInfo = async (req: Request, res: Response) => {
    try {
        const roomsInfo = await prisma.roomInfo.findMany();
        const roomsInfoCount = await prisma.roomInfo.count();
        res.json({ data: roomsInfo, count: roomsInfoCount });
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getRoomInfoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const roomInfo = await prisma.roomInfo.findUnique({ where: { roomId: id } });
        if (!roomInfo) {
            return res.status(404).json({ message: "RoomInfo not found!" });
        }
        res.json(roomInfo);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const createRoomInfo = async (req: Request, res: Response) => {
    const { roomId } = req.body;
    try {
        const roomInfo = await prisma.roomInfo.create({ data: { roomId } });
        res.status(201).json(roomInfo);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const deleteRoomInfo = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const roomInfo = await prisma.roomInfo.delete({ where: { roomId: id } });
        res.json(roomInfo);
    } catch (error) {
        res.status(400).json(error);
    }
}

export const updateRoomInfoHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        res.json(updateRoomInfo(id, req.body));
    } catch (error) {
        res.status(400).json(error);
    }
}

export const updateRoomInfo = async (id: string, data: Partial<Room>) => {
    return await prisma.roomInfo.update({ where: { roomId: id }, data });
}