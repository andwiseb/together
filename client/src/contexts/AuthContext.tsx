import React, { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserService } from '../services/user-service';
import { UserModel } from '../types';

interface AuthContextProps {
    user: UserModel;
    setUser: (user: UserModel) => void;
}

const AuthContext = React.createContext<AuthContextProps | null>(null);

export const useAuth = () => {
    return React.useContext(AuthContext);
}

const userService = new UserService();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage({ key: 'w2gCloneUser', initialValue: '' });

    useEffect(() => {
        // Invalidate User info
        userService.getUser(user?.id)
            .catch((err) => {
                console.error('load user error', err);
                if (err && (err.status && err.status === 404 ||
                    err.response && err.response.status === 404)) {
                    // Clear cached user id
                    setUser('');
                }
            });
    }, [user]);

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}