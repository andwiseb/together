import { Server } from "socket.io";

let io: Server;

export const initSocket = (appServer) => {
    io = new Server(appServer, { cors: { origin: process.env.SOCKET_ORIGINS?.split(';') } });

    io.on("connection", (socket) => {
        console.log('Socket connection:', socket.id);
        socket.on('join-room', (room: string, cb?: Function) => {
            socket.join(room);
            if (cb) {
                cb();
            }
        });

        socket.on('toggle-player-state', (state: boolean, room: string) => {
            socket.to(room).emit('toggle-player-state', state);
        });
    });
}