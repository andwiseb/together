import React, { useCallback, useEffect, useState } from 'react';
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
    const { user } = useAuth()!;
    const roomService = new RoomService(user.id);

    const id = params.get('id');

    const isAdmin = useCallback((): boolean => {
        return room?.adminId === user.id;
    }, [user, room]);

    if (!id && !link) {
        return <Navigate to="/" replace />;
    }

    // Fetch Room
    useEffect(() => {
        if (!id && !link) {
            return;
        }

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
                }
                setRoom(room);
                setError(null);
            })
            .catch((err) => setError(handleHttpError(err)))
            .finally(() => setLoading(false));

        socket.on('room-closed', () => setRoomClosed(true));
        const mediaChangeEventListener = socket.on('media-url-changed', (newMediaUrl: string) => {
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
                                    canCloseRoom={isAdmin()} />
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
                                            <WatchPlayer room={room} />
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
