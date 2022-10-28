import { Server } from "socket.io";
import { updateRoomInfo } from './api/controllers/roomInfoController';
import { getUserById } from './api/controllers/userController';
import { getRoomById, updateRoom } from './api/controllers/roomController';
import { Room } from '@prisma/client';

let io: Server;
let updateRoomInfoTimeout: any = 0;
const usersList = new Map<string, string>();

const DEBOUNCE_TIMEOUT = 500;

const updateRoomInfoFunc = (room, data) => {
    updateRoomInfoTimeout = setTimeout(
        async () => {
            await updateRoomInfo(room, data)
            clearTimeout(updateRoomInfoTimeout);
            updateRoomInfoTimeout = 0;
        }
        , DEBOUNCE_TIMEOUT);
}

const checkRoomAdmin = async (roomId: string, userId: string, allUsers: string[]): Promise<string | null> => {
    console.log('User:', userId, 'leave-room:', roomId,);
    // Get room by id
    let room: Room | null = null;
    try {
        room = await getRoomById(roomId);
    } catch (error) {
        console.error(`Fetch room ${roomId} is Failed. Reason:`, error);
    }

    if (!room) {
        return Promise.resolve(null);
    }

    // Check if the leaved socket is the admin of the room
    if (room.adminId === userId) {
        try {
            // Make the first socket as the admin of the room
            await updateRoom(roomId, { adminId: allUsers[0] });
        } catch (err) {
            console.error(`Failed to assign Room admin to user ${userId}. Reason:`, err);
        }

        return Promise.resolve(allUsers[0]);
    }
    return Promise.resolve(null);
}

export const initSocket = (appServer) => {
    io = new Server(appServer, { cors: { origin: process.env.SOCKET_ORIGINS?.split(';') } });

    // Refuse connection from socket without auth data
    io.use((socket, next) => {
        if (socket.handshake.auth?.userId) {
            getUserById(socket.handshake.auth?.userId)
                .then(() => next())
                .catch((err) => next(new Error(err?.message)));
        } else {
            next(new Error('Invalid credentials'));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log('Socket connection:', socket.id, '| user id:', userId);
        socket.data['userId'] = userId;
        usersList.set(userId as string, socket.id);


        socket.on('join-room', async (room: string, cb?: Function) => {
            await socket.join(room);
            usersList.set(socket.data.userId, socket.id)
            const allUsers = (await io.in(room).fetchSockets())?.map(u => u.data.userId);
            io.to(room).emit('room-users-list', allUsers);
            if (cb) {
                cb();
            }
        });

        socket.on("disconnecting", async () => {
            // Notify all the joined rooms about the disconnecting
            const rooms = Array.from(socket.rooms.keys()).filter(x => x !== socket.id);
            for (const room of rooms) {
                const allUsers = (await socket.in(room).fetchSockets())?.map(u => u.data.userId);
                if (allUsers.length) {
                    const newAdmin = await checkRoomAdmin(room, socket.data.userId, allUsers);
                    if (newAdmin) {
                        socket.to(room).emit('new-admin', newAdmin);
                    }
                    socket.to(room).emit('room-users-list', allUsers);
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Socket ${socket.id} disconnected.`);
            usersList.delete(socket.data.userId);
        });

        socket.on('toggle-player-state', (state: boolean, room: string, time) => {
            socket.to(room).emit('toggle-player-state', state, state ? time : null);
            // Update room info with current time
            if (!state && !updateRoomInfoTimeout && time) {
                updateRoomInfoFunc(room, { currTime: time, isPlaying: false });
            } else if (state && !updateRoomInfoTimeout && time) {
                updateRoomInfoFunc(room, { currTime: time, isPlaying: true });
            }
        });

        socket.on('query-current-time', (room: string) => {
            socket.to(room).emit('give-your-time', socket.id);
        });

        socket.on('my-time-is', (time: number, callerSocketId: string) => {
            // console.log(`Client '${callerSocketId}' here is my time`, time);
            socket.to(callerSocketId).emit('others-time-is', time);
        });

        socket.on('playback-rate-changed', (room: string, rate: number) => {
            // console.log(`Client ${socket.id} changed playback rate to ${rate} in room ${room}`);
            socket.to(room).emit('playback-rate-changed', rate);
            if (!updateRoomInfoTimeout) {
                updateRoomInfoFunc(room, { currSpeed: rate });
            }
        });

        socket.on('close-room', (room: string) => {
            socket.to(room).emit('room-closed');
        });

        socket.on('change-media-url', (room: string, mediaUrl: string) => {
            io.to(room).emit('media-url-changed', mediaUrl);
        });
    });
}