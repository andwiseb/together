import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { UserService } from '../services/user-service';
import { useAuth } from '../contexts/AuthContext';
import { RoomModel, UserModel } from '../types';
import { ListGroup } from 'react-bootstrap';

const userService = new UserService();

const RoomViewersList = ({ room }: { room: RoomModel }) => {
    const { userList } = useSocket()!;
    const { user } = useAuth()!;
    const [viewersNameList, setViewersNameList] = useState<UserModel[]>([]);

    const isAdmin = useCallback((id: string): boolean => {
        return room?.adminId === id;
    }, [room]);

    useEffect(() => {
        if (userList && userList.length) {
            Promise.all([...userList.filter(x => x !== user.id)]
                .map(uid => userService.getUser(uid)))
                .then((data) =>
                    setViewersNameList([user, ...data])
                )
                .catch(err => console.error('load viewers list error', err));
        }
    }, [userList]);

    return (
        <div className='h-100 position-relative overflow-auto'>
            <h6 className='px-2 pt-2'>Currently Watching ({viewersNameList.length}):</h6>
            <ListGroup as="ol" numbered variant="flush" className='position-absolute w-100'>
                {
                    viewersNameList.map((u, i) =>
                        <ListGroup.Item as="li" key={u.id}>
                            <span style={{ textDecoration: i === 0 ? 'underline' : 'inherit' }}>{u.username}</span>
                            &nbsp;{isAdmin(u.id) ? '*' : ''}
                        </ListGroup.Item>
                    )
                }
            </ListGroup>
        </div>
    );
};

export default RoomViewersList;
