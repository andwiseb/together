import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserContextProps {
    username: string;
    setUserName: (name: string) => {}
}

const UserContext = React.createContext<UserContextProps>({
    username: '',
    setUserName: (name: string) => {
        return name;
    }
});

export const useUser = () => {
    return React.useContext(UserContext);
}

export const UserProvider = ({ children }) => {
    const [username, setUserName] = useLocalStorage({ key: 'w2gCloneUser', initialValue: '' });
    return <UserContext.Provider value={{ username, setUserName }}>{children} </UserContext.Provider>
}