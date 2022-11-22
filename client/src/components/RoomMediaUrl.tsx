import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Dropdown, DropdownButton, Form, InputGroup, Modal } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { RoomModel } from '../types';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import ReactPlayer from 'react-player';
import RoomShareButton from './RoomShareButton';
import { useAuth } from '../contexts/AuthContext';
import { RoomService } from '../services/room-service';
import CreateUser from './CreateUser';
import { MATCH_DAILYMOTION } from './WatchPlayer';

interface RoomMediaUrlProps {
    room: RoomModel | null;
    canChangeMedia: boolean;
    canCloseRoom: boolean
}

const RoomMediaUrl = ({ room, canChangeMedia, canCloseRoom }: RoomMediaUrlProps) => {
    const { closeRoom: socketCloseRoom, changeMediaUrl: socketChangeMediaUrl } = useSocket()!;
    const navigate = useNavigate();
    const [url, setUrl] = useState<string>(room?.mediaUrl || '');
    const [urlValidity, setUrlValidity] = useState<boolean>(true);
    const [showChangeUsername, setShowChangeUsername] = useState<boolean>(false);
    const { user } = useAuth()!;
    const roomService = new RoomService(user.id);

    const canSubmit = useCallback((url: string) => {
        return !!(urlValidity && room && url !== room.mediaUrl)
    }, [room, urlValidity]);

    useEffect(() => {
        if (room) {
            changeMediaUrl(room.mediaUrl);
        }
    }, [room]);

    const closeRoomHandler = () => {
        if (!room) {
            return;
        }

        roomService.closeRoom(room.id)
            .then(() => {
                socketCloseRoom(room.id);
                navigate('/');
            })
            .catch(err => console.log('Room close error', err));
    }

    const changeMediaUrlHandler = () => {
        if (!room) {
            return;
        }

        roomService.changeRoomMediaUrl(room.id, url)
            .then(() => socketChangeMediaUrl(room.id, url))
            .catch(err => console.log('Room change media url error', err));
    }

    const changeMediaUrl = (value: string) => {
        setUrl(value);
        setUrlValidity(ReactPlayer.canPlay(value) || MATCH_DAILYMOTION.test(value));
    }

    const urlChanged = (e: SyntheticEvent) => {
        const value = (e.target as HTMLInputElement).value;
        changeMediaUrl(value);
    }

    const urlControlBlurred = () => {
        if ((!url || url.trim().length === 0 || !urlValidity) && room) {
            changeMediaUrl(room.mediaUrl);
        }
    }

    const onSubmit = (e: SyntheticEvent) => {
        e.preventDefault();

        if (!canSubmit(url)) {
            return;
        }

        changeMediaUrlHandler();
    }

    const changeUsernameHandler = () => {
        setShowChangeUsername(true);
    }

    return (
        <>
            <Form onSubmit={onSubmit} noValidate>
                <Form.Group>
                    <div className='d-flex flex-wrap flex-md-nowrap gap-2 align-items-center'>
                        <InputGroup>
                            <InputGroup.Text>url:</InputGroup.Text>
                            <Form.Control
                                value={url}
                                onChange={urlChanged}
                                isInvalid={!urlValidity}
                                readOnly={!canChangeMedia}
                                onBlur={urlControlBlurred}
                                required
                            />
                            {canChangeMedia && <Button variant="outline-dark"
                                                       onClick={changeMediaUrlHandler}
                                                       disabled={!canSubmit(url)}>
                              change
                            </Button>}
                        </InputGroup>
                        <RoomShareButton roomLink={room?.link} />
                        {
                            canCloseRoom &&
                            <Button variant="outline-dark" onClick={closeRoomHandler} className='flex-shrink-0'>
                              close room
                            </Button>
                        }
                        <DropdownButton variant='outline-dark' title={user?.username || 'guest'}>
                            <Dropdown.Item onClick={changeUsernameHandler}>change username</Dropdown.Item>
                        </DropdownButton>
                    </div>
                </Form.Group>
            </Form>

            <Modal show={showChangeUsername}
                   onHide={() => setShowChangeUsername(false)}
                   size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        change username:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser successCallback={() => setShowChangeUsername(false)} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default RoomMediaUrl;
