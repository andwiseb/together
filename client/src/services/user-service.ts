import { UserModel } from '../types';
import { createClient } from './http-client';
import { AxiosInstance } from 'axios';

export class UserService {
    private client: AxiosInstance;

    constructor() {
        this.client = createClient('/users');
    }

    createUser = async (username: string): Promise<UserModel> => {
        return await this.client.post('/', { username: username })
            .then((res) => res.data);
    }

    getUser = async (id: string): Promise<UserModel> => {
        return await this.client.get(`/${id}`)
            .then((res) => res.data);
    }

    updateUsername = async (userId: string, name: string): Promise<UserModel> => {
        return await this.client.patch(`/${userId}`, { username: name })
            .then((res) => res.data);
    }
}