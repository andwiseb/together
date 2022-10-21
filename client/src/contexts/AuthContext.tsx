import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextProps {
    user: string;
    setUser: (user: string) => void;
}

const AuthContext = React.createContext<AuthContextProps>({
    user: '',
    setUser: () => {
    }
});

export const useAuth = () => {
    return React.useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage({ key: 'w2gCloneUser', initialValue: '' });

    /*useEffect(()=>{
        getUser(user)
            .then((res) => true)
            .catch((err) => {
                console.log('load user error', err);
                if (err && (err.status && err.status === 404 || err.response && err.response.status === 404)) {
                    // Clear cached user id
                    setUser('');
                }
            });
    });*/

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}