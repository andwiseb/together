import { RoomInfoModel, RoomModel } from '../types';
import { createClient } from './http-client';
import { AxiosInstance } from 'axios';

export class RoomService {
    client: AxiosInstance;
    infoClient: AxiosInstance;

    constructor(token: string | undefined = '') {
        this.client = createClient('/rooms', token);
        this.infoClient = createClient('/rooms-info', token);
    }

    createRoom = async (mediaUrl: string): Promise<RoomModel> => {
        return await this.client.post('/', { mediaUrl })
            .then((res) => res.data);
    }

    getRoomById = async (id: string): Promise<RoomModel> => {
        return await this.client.get(`/${id}`)
            .then((res) => res.data);
    }

    getRoomByLink = async (link: string): Promise<RoomModel> => {
        return await this.client.get(`/by-link/${link}`)
            .then((res) => res.data);
    }

    createRoomInfo = async (roomId: string): Promise<RoomInfoModel> => {
        return await this.infoClient.post('/', { roomId })
            .then((res) => res.data);
    }

    closeRoom = async (roomId: string): Promise<void> => {
        return await this.infoClient.patch(`/${roomId}`, { isOpened: false });
    }

    changeRoomMediaUrl = async (roomId: string, mediaUrl: string) => {
        return await Promise.all([
            this.infoClient.patch(`/${roomId}`, { currTime: 0, currSpeed: 1, isPlaying: false }),
            this.client.patch(`/${roomId}`, { mediaUrl }),
        ]);
    }
}