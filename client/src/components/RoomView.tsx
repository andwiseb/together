import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useSearchParams } from 'react-router-dom';
import { getRoom } from '../services/room-service';
import { RoomModel } from '../types';
import { Card } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';

const RoomView = () => {
    const [params] = useSearchParams();
    const [room, setRoom] = useState<RoomModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { username } = useUser();

    const id = params.get('id');

    useEffect(() => {
        if (!id || room) {
            return;
        }

        setLoading(true);

        getRoom(id)
            .then((res) => {
                console.log('room', res);
                setRoom(res);
            })
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            {room ?
                <Container>
                    <Row>
                        <Col sm={10} className='player-wrapper'>
                            <ReactPlayer className='react-player'
                                         url={room?.mediaUrl}
                                         width='100%'
                                         height='100%'
                                         config={{
                                             facebook: {
                                                 attributes: {
                                                     'data-height': 540,
                                                 },
                                             },
                                         }}
                                         controls />
                        </Col>
                        <Col sm={2}>
                            <Card className='mt-3' style={{height: '540px'}}>
                                <Card.Body>
                                    <Card.Title>Users List:</Card.Title>
                                    <Card.Text>
                                        <ol>
                                            <li>{username}</li>
                                        </ol>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container> :
                <h1>Loading Room ...</h1>
            }
        </>
    );
};

export default RoomView;
