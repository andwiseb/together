import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserContextProps {
    user: string;
    setUser: (user: string) => {}
}

const UserContext = React.createContext<UserContextProps>({
    user: '',
    setUser: (user: string) => {
        return user;
    }
});

export const useUser = () => {
    return React.useContext(UserContext);
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage({ key: 'w2gCloneUser', initialValue: '' });
    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}