import { RoomModel } from '../types';
import { createClient } from './http-client';

const client = createClient('/rooms');

export const createRoom = async (mediaUrl: string): Promise<RoomModel> => {
    return await client.post('/', { mediaUrl })
        .then((res) => res.data);
}

export const getRoomById = async (id: string): Promise<RoomModel> => {
    return await client.get(`/${id}`)
        .then((res) => res.data);
}

export const getRoomByLink = async (link: string): Promise<RoomModel> => {
    return await client.get(`/by-link/${link}`)
        .then((res) => res.data);
}