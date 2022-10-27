import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { RoomModel } from '../types';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import ReactPlayer from 'react-player';
import RoomShareButton from './RoomShareButton';
import { useAuth } from '../contexts/AuthContext';
import { RoomService } from '../services/room-service';

interface RoomMediaUrlProps {
    room: RoomModel;
    canChangeMedia: boolean;
    canCloseRoom: boolean
}

const RoomMediaUrl = ({ room, canChangeMedia, canCloseRoom }: RoomMediaUrlProps) => {
    const { closeRoom: socketCloseRoom, changeMediaUrl: socketChangeMediaUrl } = useSocket()!;
    const navigate = useNavigate();
    const [url, setUrl] = useState<string>(room.mediaUrl);
    const [urlValidity, setUrlValidity] = useState<boolean>(true);
    const { user } = useAuth()!;
    const roomService = new RoomService(user.id);

    useEffect(() => {
        changeMediaUrl(room.mediaUrl);
    }, [room]);

    const closeRoomHandler = () => {
        roomService.closeRoom(room.id)
            .then(() => {
                socketCloseRoom(room.id);
                navigate('/');
            })
            .catch(err => console.log('Room close error', err));
    }

    const changeMediaUrlHandler = () => {
        roomService.changeRoomMediaUrl(room.id, url)
            .then(() => socketChangeMediaUrl(room.id, url))
            .catch(err => console.log('Room change media url error', err));
    }

    const changeMediaUrl = (value: string) => {
        setUrl(value);
        setUrlValidity(ReactPlayer.canPlay(value));
    }

    const urlChanged = (e: SyntheticEvent) => {
        const value = (e.target as HTMLInputElement).value;
        changeMediaUrl(value);
    }

    const urlControlBlurred = () => {
        if (!url || url.trim().length === 0 || !urlValidity) {
            changeMediaUrl(room.mediaUrl);
        }
    }

    return (
        <Form noValidate>
            <Form.Group>
                <div className='d-flex gap-2 align-items-baseline'>
                    <InputGroup>
                        <InputGroup.Text>Media Url:</InputGroup.Text>
                        <Form.Control
                            value={url}
                            onChange={urlChanged}
                            isInvalid={!urlValidity}
                            readOnly={!canChangeMedia}
                            onBlur={urlControlBlurred}
                            required
                        />
                        {canChangeMedia && <Button variant="outline-primary"
                                                   onClick={changeMediaUrlHandler}
                                                   disabled={!urlValidity || url === room.mediaUrl}>
                          Change
                        </Button>}
                    </InputGroup>
                    <RoomShareButton roomLink={room.link} />
                    {
                        canCloseRoom &&
                        <Button variant="danger" onClick={closeRoomHandler} className='flex-shrink-0'>
                          Close Room
                        </Button>
                    }
                </div>
            </Form.Group>
        </Form>
    );
};

export default RoomMediaUrl;
