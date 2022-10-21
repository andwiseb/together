import React, { useState, useEffect, createContext, useContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

let socket: Socket;

interface SocketContextProps {
    isConnected: boolean;
    lastPong: string | null;
    sendPing: () => void;
    joinRoom: (roomId: string, callbackFunc?: Function) => void;
    togglePlayPause: (state: boolean, roomId: string, time: number) => void;
    playingChanged: boolean;
    queryCurrTime: (roomId: string) => void;
    queriedTime: number | undefined;
    sendYourTime?: (time: number) => void;
    userList: string[];
    setUserList: (list: string[]) => void;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = (): SocketContextProps | null => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    if (!socket || socket.disconnected) {
        socket = io(import.meta.env.VITE_SOCKET_URL, { query: { userId: user }, auth: { userId: user } })
    }

    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [lastPong, setLastPong] = useState<string | null>(null);
    const [playingChanged, setPlayingChanged] = useState<boolean>(true);
    const [queriedTime, setQueriedTime] = useState<number | undefined>();
    const [sendYourTime, setSendYourTime] = useState<(time: number) => void | undefined>();
    const [userList, setUserList] = useState<string[]>([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('I connected with id', socket.id);
            setIsConnected(true);
        });

        socket.on('connect_error', err => {
            setIsConnected(false);
            console.error('Connection Error', err);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('pong', () => {
            setLastPong(new Date().toISOString());
        });

        socket.on('toggle-player-state', (state: boolean) => {
            setPlayingChanged(state);
        });

        socket.on('give-your-time', (callSocketId: string) => {
            // console.log(`Some one '${callSocketId}' is querying for my time`);
            setSendYourTime(() => (time) => {
                socket.emit('my-time-is', time, callSocketId)
            });
        });

        socket.on('others-time-is', (time: number) => {
            // console.log('[SOCKET Event] Others time is ', time);
            setQueriedTime(time);
        });

        socket.on('room-users-list', (list: string[]) => {
            setUserList(list);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('pong');
            socket.off('toggle-player-state');
            socket.off('give-your-time');
            socket.off('others-time-is');
            socket.off('room-users-list');
        };
    }, [user]);

    const sendPing = () => {
        socket.emit('ping');
    }

    const joinRoom = (roomId: string, callbackFunc?: Function) => {
        socket.emit('join-room', roomId, callbackFunc);
    }

    const togglePlayPause = (state: boolean, roomId: string, time: number) => {
        socket.emit('toggle-player-state', state, roomId, time);
    }

    const queryCurrTime = (roomId: string) => {
        socket.emit('query-current-time', roomId);
    }

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                lastPong,
                sendPing,
                joinRoom,
                togglePlayPause,
                playingChanged,
                queryCurrTime,
                queriedTime,
                sendYourTime,
                userList,
                setUserList
            }}
        >
            {children}
        </SocketContext.Provider>
    )
};