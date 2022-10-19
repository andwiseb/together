import React, { useState, useEffect, createContext, useContext } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

interface SocketContextProps {
    isConnected: boolean;
    lastPong: string | null;
    sendPing: () => void;
    joinRoom: (roomLink: string, callbackFunc?: Function) => void;
    togglePlayPause: (state: boolean, room: string) => void;
    playingChanged: boolean;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = (): SocketContextProps | null => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [lastPong, setLastPong] = useState<string | null>(null);
    const [playingChanged, setPlayingChanged] = useState<boolean>(true);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
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

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('pong');
            socket.off('toggle-player-state');
        };
    }, []);

    const sendPing = () => {
        socket.emit('ping');
    }

    const joinRoom = (roomLink: string, callbackFunc?: Function) => {
        socket.emit('join-room', roomLink, callbackFunc);
    }

    const togglePlayPause = (state: boolean, room: string) => {
        socket.emit('toggle-player-state', state, room);
    }

    return (
        <SocketContext.Provider
            value={{ isConnected, lastPong, sendPing, joinRoom, togglePlayPause, playingChanged }}
        >
            {children}
        </SocketContext.Provider>
    )
};