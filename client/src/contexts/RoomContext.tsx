import React, { useState } from 'react';
import ReactPlayer from 'react-player';

interface RoomContextProps {
    playerRef?: ReactPlayer;
    setPlayerRef: (ref) => void;
}

const RoomContext = React.createContext<RoomContextProps | null>(null);

export const useRoom = () => {
    return React.useContext(RoomContext);
}
export const RoomProvider = ({ children }) => {
    const [playerRef, setPlayerRef] = useState(undefined);
    return (
        <RoomContext.Provider value={{ playerRef, setPlayerRef}}>
            {children}
        </RoomContext.Provider>
    )
}