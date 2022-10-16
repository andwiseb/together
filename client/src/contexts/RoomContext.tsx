import React from 'react';

interface RoomContextProps {
    url: string;
}

const RoomContext = React.createContext<RoomContextProps>({ url: '' });

export const useRoom = () => {
    return React.useContext(RoomContext);
}
export const RoomProvider = ({ children }) => {
    return <RoomContext.Provider value={{ url: '' }}>{children} </RoomContext.Provider>
}