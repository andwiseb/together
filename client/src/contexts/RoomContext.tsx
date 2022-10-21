import React, { useState } from 'react';
import ReactPlayer from 'react-player';

interface RoomContextProps {
    playerRef?: ReactPlayer;
    setPlayerRef: (ref) => void;
    initVideoTime?: number;
    setInitVideoTime: (time: number) => void;
}

const RoomContext = React.createContext<RoomContextProps | null>(null);

export const useRoom = () => {
    return React.useContext(RoomContext);
}
export const RoomProvider = ({ children }) => {
    const [playerRef, setPlayerRef] = useState(undefined);
    const [initVideoTime, setInitVideoTime] = useState(0);
    return (
        <RoomContext.Provider value={{ playerRef, setPlayerRef, initVideoTime, setInitVideoTime }}>
            {children}
        </RoomContext.Provider>
    )
}