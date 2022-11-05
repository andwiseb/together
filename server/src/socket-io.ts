import { Server } from "socket.io";
import { updateRoomInfo } from './api/controllers/roomInfoController';
import { getUserById } from './api/controllers/userController';
import { getRoomById, updateRoom } from './api/controllers/roomController';
import { Room, RoomInfo } from '@prisma/client';

let io: Server;
// setTimeout handler for updating room-info function call
let updateRoomInfoTimeout: any = 0;
// Timeout that used in setTimeout
const DEBOUNCE_TIMEOUT = 500;
// Store connected users [user_id, socket_id]
const usersList = new Map<string, string>();

// Call a debounced updateRoomInfo function
const updateRoomInfoFunc = (room: string, data: Partial<RoomInfo>) => {
    updateRoomInfoTimeout = setTimeout(
        () => {
            updateRoomInfo(room, data)
                .catch((err) => console.log('Failed to update room info', err))
                .finally(() => {
                    clearTimeout(updateRoomInfoTimeout);
                    updateRoomInfoTimeout = 0;
                });
        }
        , DEBOUNCE_TIMEOUT);
}

// Check if the passed user is the admin of the passed room,
// if so, assign the administration to the first user from the passed allUsers array
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

    // Check if the leaved user is the admin of the room
    if (room.adminId === userId) {
        try {
            // Make the first user as the admin of the room
            await updateRoom(roomId, { adminId: allUsers[0] });
        } catch (err) {
            console.error(`Failed to assign Room admin to user ${userId}. Reason:`, err);
            return Promise.resolve(null);
        }

        return Promise.resolve(allUsers[0]);
    }
    return Promise.resolve(null);
}

// Init the socket-io server
export const initSocket = (appServer) => {
    io = new Server(appServer, { cors: { origin: process.env.SOCKET_ORIGINS?.split(';') } });

    // Refuse connection from socket without auth data
    io.use((socket, next) => {
        if (socket.handshake.auth?.userId) {
            getUserById(socket.handshake.auth?.userId)
                .then(() => next())
                .catch((err) => {
                    // Disconnect the user because his connection will still be established
                    socket.disconnect(true);
                    next(new Error(err?.message));
                });
        } else {
            next(new Error('Invalid credentials'));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log('Socket connection:', socket.id, '| user id:', userId);
        socket.data['userId'] = userId;
        socket.data['username'] = socket.handshake.query.username;
        usersList.set(userId as string, socket.id);

        socket.on('join-room', async (room: string, cb?: Function) => {
            await socket.join(room);
            usersList.set(socket.data.userId, socket.id);
            // After join the room, send a notification to all users containing the full users list
            const allUsers = (await io.in(room).fetchSockets())?.map(u => u.data.userId);
            io.to(room).emit('room-users-list', allUsers);
            // Invoke the passed call-back
            if (cb && typeof cb === 'function') {
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
                    socket.to(room).emit('message-received', `${socket.data.username} leaved the room.`,
                        null, new Date().toISOString());
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Socket ${socket.id} disconnected.`);
            usersList.delete(socket.data.userId);
        });

        socket.on('toggle-player-state', (state: boolean, room: string, time) => {
            socket.to(room).emit('toggle-player-state', state, state ? time : null);
            // Update room info with current time and playing state
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

        socket.on('send-message', (room: string, text: string, username: string | null, time, cb?: () => void) => {
            io.to(room).emit('message-received', text, username, time);
            if (cb && typeof cb === 'function') {
                cb();
            }
        });
    });
}