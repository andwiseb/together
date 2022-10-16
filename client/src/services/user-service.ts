import { UserModel } from '../types';
import { createClient } from './http-client';

const client = createClient('/users');

export const createUser = async (username: string): Promise<UserModel> => {
    return await client.post('/', { username: username })
        .then((res) => res.data);
}

export const getUser = async (id: string): Promise<UserModel> => {
    return await client.get(`/${id}`)
        .then((res) => res.data);
}