import { RoomModel } from '../types';
import { createClient } from './http-client';

const client = createClient('/rooms');

export const createRoom = async (mediaUrl: string): Promise<RoomModel> => {
    return await client.post('/', { mediaUrl })
        .then((res) => res.data);
}

export const getRoom = async (id: string): Promise<RoomModel> => {
    return await client.get(`/${id}`)
        .then((res) => res.data);
}