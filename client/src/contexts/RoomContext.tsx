import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

interface RoomContextProps {
    playerRef?: ReactPlayer;
    setPlayerRef: (ref) => void;
    isNewRoom: boolean;
    setIsNewRoom: (state: boolean) => void;
    error?: any;
    setError: (err: any) => void;
    unreadMessagesCount: number;
    setUnreadMessagesCount: Dispatch<SetStateAction<number>>;
    userAway: boolean;
    setUserAway: (state: boolean) => void;
}

const RoomContext = React.createContext<RoomContextProps | null>(null);

export const useRoom = () => {
    return React.useContext(RoomContext);
}
export const RoomProvider = ({ children }) => {
    const [playerRef, setPlayerRef] = useState(undefined);
    const [isNewRoom, setIsNewRoom] = useState(false);
    const [error, setError] = useState<null | any>(null);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [userAway, setUserAway] = useState(false);

    useEffect(() => {
        const listener = () => {
            setUserAway(document.visibilityState === 'hidden');
        };
        document.addEventListener('visibilitychange', listener);
        return () => {
            document.removeEventListener('visibilitychange', listener);
        };
    }, []);

    return (
        <RoomContext.Provider value={{
            playerRef,
            setPlayerRef,
            isNewRoom,
            setIsNewRoom,
            error,
            setError,
            unreadMessagesCount,
            setUnreadMessagesCount,
            userAway,
            setUserAway
        }}>
            {children}
        </RoomContext.Provider>
    )
}