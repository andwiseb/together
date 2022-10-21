import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { getUser } from '../services/user-service';

const RoomViewersList = () => {
    const { userList } = useSocket()!;
    const [viewersNameList, setViewersNameList] = useState<string[]>([]);

    useEffect(() => {
        if (userList && userList.length) {
            Promise.all(userList.map(uid => getUser(uid)))
                .then((data) => setViewersNameList(data.map(u => u.username)));
        }
    }, [userList]);

    return (
        <>
            <h6>Currently Watching ({viewersNameList.length}):</h6>
            <ol>
                {
                    viewersNameList.map(u =>
                        <li key={u}>{u}</li>
                    )
                }
            </ol>
        </>
    );
};

export default RoomViewersList;
