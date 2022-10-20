import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getRoomById, getRoomByLink } from '../services/room-service';
import { RoomModel } from '../types';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '../contexts/SocketContext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import WatchPlayer from './WatchPlayer';
import { getUser } from '../services/user-service';

const RoomNotFound = () => {
    return <h1>Room not found! :(</h1>;
}

const RoomView = () => {
    const [params] = useSearchParams();
    const { link } = useParams();
    const { user, setUser } = useUser();
    const { joinRoom } = useSocket()!;
    const [room, setRoom] = useState<RoomModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [roomLink, setRoomLink] = useState<string>('');
    const [roomLinkCopied, setRoomLinkCopied] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const navigate = useNavigate();

    const id = params.get('id');

    if (!id && !link) {
        return <RoomNotFound />
    }

    useEffect(() => {
        if (!id && !link) {
            return;
        }

        setLoading(true);

        (id ? getRoomById(id) : getRoomByLink(link as string))
            .then((room) => {
                console.log('room', room);
                joinRoom(room.link, () => console.log('Joined room:', room.link));
                setRoomLink(window.location.origin + '/' + room.link)
                setRoom(room);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!user) {
            return;
        }

        getUser(user)
            .then((res) => setUsername(res.username))
            .catch((err) => {
                console.log('load user error', err);
                if (err && (err.status && err.status === 404 || err.response && err.response.status === 404)) {
                    // Clear cached user id
                    setUser('');
                    // Return to home route, create user
                    navigate('/');
                }
            });
    }, [user])

    return (
        <>
            {room ?
                <Container>
                    <Row>
                        <Col className='player-wrapper'>
                            <WatchPlayer room={room} />
                        </Col>
                    </Row>
                    <Row>
                        <Card className='my-2'>
                            <Card.Body>
                                <Card.Title>Room Info:</Card.Title>
                                <Card.Text as='div'>
                                    <InputGroup>
                                        <InputGroup.Text>Share Room link:</InputGroup.Text>
                                        <Form.Control
                                            defaultValue={roomLink}
                                            readOnly
                                        />
                                        <CopyToClipboard text={roomLink}
                                                         onCopy={() => setRoomLinkCopied(true)}>
                                            <Button variant="outline-secondary">
                                                {roomLinkCopied ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </CopyToClipboard>
                                    </InputGroup>
                                    <hr />
                                    <h6>Currently Watching:</h6>
                                    <ol>
                                        <li>{username}</li>
                                    </ol>
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
