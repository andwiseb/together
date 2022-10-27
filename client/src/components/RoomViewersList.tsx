import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { UserService } from '../services/user-service';
import { useAuth } from '../contexts/AuthContext';

const userService = new UserService();

const RoomViewersList = () => {
    const { userList } = useSocket()!;
    const { user } = useAuth()!;
    const [viewersNameList, setViewersNameList] = useState<string[]>([]);

    useEffect(() => {
        if (userList && userList.length) {
            Promise.all([...userList.filter(x => x !== user.id)]
                .map(uid => userService.getUser(uid)))
                .then((data) =>
                    setViewersNameList([user.username, ...data.map(u => u.username)])
                );
        }
    }, [userList]);

    return (
        <>
            <h6>Currently Watching ({viewersNameList.length}):</h6>
            <ol>
                {
                    viewersNameList.map((u, i) =>
                        <li key={u} style={{ textDecoration: i === 0 ? 'underline' : 'inherit' }}>{u}</li>
                    )
                }
            </ol>
        </>
    );
};

export default RoomViewersList;
