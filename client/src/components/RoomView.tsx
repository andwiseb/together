import React, { useEffect, useMemo, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { RoomModel } from '../types';
import { useSocket } from '../contexts/SocketContext';
import WatchPlayer from './WatchPlayer';
import RoomMediaUrl from './RoomMediaUrl';
import { RoomService } from '../services/room-service';
import { useAuth } from '../contexts/AuthContext';
import { handleHttpError } from '../services/http-client';
import PageFooter from './PageFooter';
import VideoSidebar from './VideoSidebar';
import { Modal } from 'react-bootstrap';
import CreateUser from './CreateUser';
import { useRoom } from '../contexts/RoomContext';
import { APP_TITLE } from './LandingPage';

const ErrorDisplay = ({ error }) => {
    return (
        <Row className='text-center text-capitalize'>
            <h2>{typeof error === 'string' ? error : JSON.stringify(error)}</h2>
        </Row>
    );
}

const RoomView = () => {
    const [params] = useSearchParams();
    const { link } = useParams();
    const { isConnected, joinRoom, socket, sendMessage } = useSocket()!;
    const [room, setRoom] = useState<RoomModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);
    const [roomClosed, setRoomClosed] = useState<boolean>(false);
    const [showCreateUser, setShowCreateUser] = useState<boolean>(false);
    const { user } = useAuth()!;
    const mediaUrlChanged = useRef(false);
    const { unreadMessagesCount, userAway } = useRoom()!;
    let roomService: RoomService;

    const id = params.get('id');

    const isAdmin = useMemo<boolean>((): boolean => {
        return room?.adminId === user.id;
    }, [user, room]);

    if (!id && !link) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        if (!user) {
            setShowCreateUser(true);
        }
    }, [user])

    // Fetch Room
    useEffect(() => {
        if (!id && !link || !user) {
            return;
        }

        roomService = new RoomService(user.id);
        setLoading(true);

        (id ? roomService.getRoomById(id) : roomService.getRoomByLink(link as string))
            .then((room) => {
                // Check if room is closed
                if (room.roomInfo && !room.roomInfo.isOpened) {
                    setRoomClosed(true);
                } else {
                    joinRoom(room.id, () => {
                        console.log('Joined room:', room.link);
                        sendMessage(room.id, `${user.username} joined the room.`, null);
                    });
                    // Request permission to send notifications
                    Notification.requestPermission()
                        .then(ans => console.log('Notifications permission:', ans))
                        .catch(err => console.log('Notifications permission error:', err));
                }
                setRoom(room);
                setError(null);
            })
            .catch((err) => setError(handleHttpError(err)))
            .finally(() => setLoading(false));

        socket.on('room-closed', () => setRoomClosed(true));
        const mediaChangeEventListener = socket.on('media-url-changed', (newMediaUrl: string) => {
            // mediaUrlChanged should be calculated on RoomView level also, because it was bound to the player
            // and when url changes the player this will not work as expected
            mediaUrlChanged.current = true;
            setRoom((prevRoom) =>
                ({
                    ...prevRoom!,
                    mediaUrl: newMediaUrl,
                    roomInfo: { ...prevRoom!.roomInfo!, currSpeed: 1, currTime: 0, isPlaying: false }
                })
            );
        });
        socket.on('new-admin', (userId: string) => {
            setRoom((prevRoom) => ({
                ...prevRoom!, adminId: userId
            }));
        });

        return () => {
            socket.off('room-closed');
            socket.off('media-url-changed', mediaChangeEventListener as any);
            socket.off('new-admin');
        }
    }, [socket]);

    useEffect(() => {
        const title = `${APP_TITLE} | room`;
        if (unreadMessagesCount && userAway) {
            document.title = `(${unreadMessagesCount}) ${title}`;
        } else {
            document.title = title;
        }
    }, [unreadMessagesCount]);

    if (showCreateUser) {
        return (<Modal show={showCreateUser}
                       onHide={() => setShowCreateUser(false)}
                       dialogClassName="modal-50w" backdrop="static" centered>
                <Modal.Header>
                    <Modal.Title>
                        Create User:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser successCallback={() => setShowCreateUser(false)} />
                </Modal.Body>
                <PageFooter />
            </Modal>
        )
    }

    if (loading) {
        return <h1>Loading Room ...</h1>;
    }

    return (
        <>
            <Container>
                <header
                    className='d-flex gap-1 gap-lg-5 flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom'>
                    <Link to="/"
                          className="mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                        <span className="fs-4">ww2g</span>
                    </Link>
                    {!error && !roomClosed && isConnected && <div className='flex-fill'>
                      <RoomMediaUrl room={room}
                                    canChangeMedia={true}
                                    canCloseRoom={isAdmin} />
                    </div>}
                </header>
            </Container>
            <Container>
                {
                    !isConnected ?
                        <ErrorDisplay error={`You're offline, you can't join/watch this room right now!`} />
                        :
                        room ?
                            roomClosed ?
                                <ErrorDisplay error='Sorry! Room is closed :(' />
                                :
                                <Row>
                                    <Col>
                                        <div className='player-wrapper'>
                                            <WatchPlayer room={room} defMediaUrlChanged={mediaUrlChanged.current} />
                                        </div>
                                    </Col>
                                    <Col lg="3" md="12" className='pt-3 py-lg-0 ps-lg-0'>
                                        <VideoSidebar room={room} />
                                    </Col>
                                </Row>
                            :
                            <ErrorDisplay error={error} />
                }
            </Container>
            <PageFooter />
        </>
    );
};

export default RoomView;
