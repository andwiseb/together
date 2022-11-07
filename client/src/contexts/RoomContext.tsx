import React, { useState } from 'react';
import ReactPlayer from 'react-player';

interface RoomContextProps {
    playerRef?: ReactPlayer;
    setPlayerRef: (ref) => void;
    isNewRoom: boolean;
    setIsNewRoom: (state: boolean) => void;
    error?: any;
    setError: (err: any) => void;
}

const RoomContext = React.createContext<RoomContextProps | null>(null);

export const useRoom = () => {
    return React.useContext(RoomContext);
}
export const RoomProvider = ({ children }) => {
    const [playerRef, setPlayerRef] = useState(undefined);
    const [isNewRoom, setIsNewRoom] = useState(false);
    const [error, setError] = useState<null | any>(null);
    return (
        <RoomContext.Provider value={{ playerRef, setPlayerRef, isNewRoom, setIsNewRoom, error, setError }}>
            {children}
        </RoomContext.Provider>
    )
}