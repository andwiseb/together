import React, { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import { createRoomInfo, getRoomById, getRoomByLink } from '../services/room-service';
import { RoomModel } from '../types';
import { useSocket } from '../contexts/SocketContext';
import WatchPlayer from './WatchPlayer';
import RoomViewersList from './RoomViewersList';
import RoomLinkShare from './RoomLinkShare';

const RoomNotFound = () => {
    return <h1>Room not found! :(</h1>;
}

const RoomView = () => {
    const [params] = useSearchParams();
    const { link } = useParams();
    const { isConnected, joinRoom, queryCurrTime } = useSocket()!;
    const [room, setRoom] = useState<RoomModel | null>(null);
    const [, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const isPeer = useRef<boolean>(false);
    const [roomClosed, setRoomClosed] = useState<boolean>(false);

    const id = params.get('id');

    if (!id && !link) {
        return <RoomNotFound />
    }

    // Fetch Room
    useEffect(() => {
        if (!id && !link) {
            return;
        }

        setLoading(true);

        (id ? getRoomById(id) : getRoomByLink(link as string))
            .then((room) => {
                // Check if room is closed
                if (room.roomInfo && !room.roomInfo.isOpened) {
                    setRoomClosed(true);
                } else {
                    joinRoom(room.id, () => console.log('Joined room:', room.link));
                }
                setRoom(room);

                if (room.roomInfo) {
                    isPeer.current = true;
                } else {
                    // Create room info record as sign of room opening
                    console.log('create room info', room);
                    createRoomInfo(room.id);
                }
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [id, link]);

    // If Peer is joined, emit message to ask other users for current video time to seek to it
    /*useEffect(() => {
        if (isPeer && room) {
            // Emit message to ask for current room info
            // console.log('I am about to query current time...');
            queryCurrTime(room.id);
        }
    }, [isPeer]);*/

    if (roomClosed) {
        return <h1>Sorry! Room is closed :(</h1>;
    }

    if (!isConnected) {
        return <h1>You're offline, you can't join this Room!</h1>
    }

    return (
        <>
            {room ?
                <Container>
                    <Row>
                        <Col className='player-wrapper'>
                            <WatchPlayer room={room} isPeer={isPeer.current} />
                        </Col>
                    </Row>
                    <Row>
                        <Card className='my-2'>
                            <Card.Body>
                                <Card.Title>Room Info:</Card.Title>
                                <Card.Text as='div'>
                                    <RoomLinkShare roomLink={room.link} />
                                    <hr />
                                    <RoomViewersList />
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Row>
                </Container> :
                error ? <RoomNotFound /> : <h1>Loading Room ...</h1>
            }
        </>
    );
};

export default RoomView;
