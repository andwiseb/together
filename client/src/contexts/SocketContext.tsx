import React, { useState, useEffect, createContext, useContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

let socket: Socket;

interface SocketContextProps {
    socket: Socket;
    isConnected: boolean;
    joinRoom: (roomId: string, callbackFunc?: Function) => void;
    togglePlayPause: (state: boolean, roomId: string, time: number) => void;
    queryCurrTime: (roomId: string) => void;
    queriedTime: number | undefined;
    resetQueriedTime: () => void;
    sendYourTime?: (time: number) => void;
    userList: string[];
    setUserList: (list: string[]) => void;
    changePlaybackRate: (roomId: string, rate: number) => void;
    playbackRate: number;
    closeRoom: (roomId: string) => void;
    changeMediaUrl: (roomId: string, mediaUrl: string) => void;
    sendMessage: (roomId: string, text: string, username: string | null, time?: string, cb?: () => void) => void;
    notifySeekVideo: (roomId: string, seconds: number) => void;
    notifyVideoSeeked?: number;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = (): SocketContextProps | null => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const { user } = useAuth()!;
    // TODO: use useRef in socket init
    if (!socket || socket.disconnected) {
        socket = io(import.meta.env.VITE_SOCKET_URL, {
            path: '/wsapp/',
            query: { userId: user.id, username: user.username },
            auth: { userId: user.id },
            transports: ['websocket']
        });
    }

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [queriedTime, setQueriedTime] = useState<number | undefined>();
    const [sendYourTime, setSendYourTime] = useState<(time: number) => void | undefined>();
    const [userList, setUserList] = useState<string[]>([]);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [notifyVideoSeeked, setNotifyVideoSeeked] = useState<undefined | number>();

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

        socket.on('playback-rate-changed', (rate: number) => {
            setPlaybackRate(rate);
        });

        socket.on('video-seeked', (seconds: number) => {
            setNotifyVideoSeeked(seconds);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('give-your-time');
            socket.off('others-time-is');
            socket.off('room-users-list');
            socket.off('playback-rate-changed');
            socket.off('video-seeked');
        };
    }, [user]);

    const joinRoom = (roomId: string, callbackFunc?: Function) => {
        socket.emit('join-room', roomId, callbackFunc);
    }

    const togglePlayPause = (state: boolean, roomId: string, time: number) => {
        console.log('I TOGGLED PLAYER STATE TO', state);
        socket.emit('toggle-player-state', state, roomId, time);
    }

    const queryCurrTime = (roomId: string) => {
        socket.emit('query-current-time', roomId);
    }

    const changePlaybackRate = (roomId: string, rate: number) => {
        socket.emit('playback-rate-changed', roomId, rate);
    }

    const closeRoom = (roomId: string) => {
        socket.emit('close-room', roomId);
    }

    const changeMediaUrl = (roomId: string, mediaUrl: string) => {
        socket.emit('change-media-url', roomId, mediaUrl);
    }

    const sendMessage = (roomId: string, text: string, username: string | null, time?: string, cb?: () => void) => {
        if (!time) {
            time = new Date().toISOString();
        }
        socket.emit('send-message', roomId, text, username, time, cb);
    }

    const notifySeekVideo = (roomId: string, seconds: number) => {
        socket.emit('seek-video', roomId, seconds);
    }

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                joinRoom,
                togglePlayPause,
                queryCurrTime,
                queriedTime,
                resetQueriedTime: () => setQueriedTime(undefined),
                sendYourTime,
                userList,
                setUserList,
                changePlaybackRate,
                playbackRate,
                socket,
                closeRoom,
                changeMediaUrl,
                sendMessage,
                notifySeekVideo,
                notifyVideoSeeked
            }}
        >
            {children}
        </SocketContext.Provider>
    )
};