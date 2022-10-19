import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { RoomProvider } from './contexts/RoomContext';
import { SocketProvider } from './contexts/SocketContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <UserProvider>
            <RoomProvider>
                <SocketProvider>
                    <App />
                </SocketProvider>
            </RoomProvider>
        </UserProvider>
    </React.StrictMode>
);
