import React, { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import { RoomModel } from '../types';
import { useSocket } from '../contexts/SocketContext';
import WatchPlayer from './WatchPlayer';
import RoomViewersList from './RoomViewersList';
import RoomMediaUrl from './RoomMediaUrl';
import { RoomService } from '../services/room-service';
import { useAuth } from '../contexts/AuthContext';
import { handleHttpError } from '../services/http-client';
import ChatSection from './ChatSection';

const RoomNotFound = () => {
    return <h1>Room not found! :(</h1>;
}

const ErrorDisplay = ({ error }) => {
    return <h1>{typeof error === 'string' ? error : JSON.stringify(error)}</h1>;
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
        return <RoomNotFound />
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

    if (roomClosed) {
        return <h1>Sorry! Room is closed :(</h1>;
    }

    if (!isConnected) {
        return <h1>You're offline, you can't join/watch this room right now!</h1>
    }

    return (
        <>
            {room ?
                <Container>
                    <Row>
                        <Col className='p-0'>
                            <RoomMediaUrl room={room}
                                          canChangeMedia={true}
                                          canCloseRoom={isAdmin()} />
                            <hr />
                        </Col>
                    </Row>
                    <Row>
                        <Col className='player-wrapper'>
                            <WatchPlayer room={room} />
                        </Col>
                        <Col lg="auto" md="12" className='px-0 ps-lg-2 py-lg-3'>
                            <ChatSection room={room} />
                        </Col>
                    </Row>
                    {/*<Row>
                        <Card className='my-2'>
                            <Card.Body>
                                <Card.Title>Room Info:</Card.Title>
                                <Card.Text as='div'>
                                    <RoomViewersList room={room} />
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Row>*/}
                </Container> :
                <ErrorDisplay error={error} />
            }
        </>
    );
};

export default RoomView;
