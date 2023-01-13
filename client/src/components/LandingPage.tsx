import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import bwHeroImage from '../assets/hero_black_white.png';
import { useAuth } from '../contexts/AuthContext';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { Alert, Modal, Spinner } from 'react-bootstrap';
import CreateUser from './CreateUser';
import PageFooter from './PageFooter';
import PageHeader from './PageHeader';
import { RoomService } from '../services/room-service';
import { handleHttpError } from '../services/http-client';
import { useRoom } from '../contexts/RoomContext';

const defRoomUrl = import.meta.env.VITE_DEF_ROOM_VIDEO_URL;
export const APP_TITLE = 'fun2g';

const LandingPage = () => {
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [newUserCreated, setNewUserCreated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<null | any>(null);
    const { user } = useAuth()!;
    const navigate = useNavigate();
    const { setIsNewRoom } = useRoom()!
    let roomService: RoomService;

    useEffect(() => {
        if (newUserCreated && user) {
            createRoomHandler();
        }

        document.title = `${APP_TITLE} | watch videos with friends`;
    }, [user]);

    const createRoomHandler = () => {
        if (user) {
            setError(null);
            setLoading(true);
            roomService = new RoomService(user.id);
            roomService.createRoom(defRoomUrl)
                .then((room) => {
                    setLoading(false);
                    setIsNewRoom(true);
                    navigate({
                        pathname: '/room',
                        search: createSearchParams({ id: room.id }).toString()
                    });
                })
                .catch((err) => {
                    console.error('create room error', err);
                    setError(handleHttpError(err));
                });
        } else {
            setShowCreate(true);
        }
    }

    return (
        <>
            <PageHeader />
            <Container className='col-xxl-8 px-4 py-5'>
                <Row className='flex-lg-row-reverse align-items-center g-5 py-5'>
                    <Col md={10} sm={8} lg={6}>
                        <img src={bwHeroImage} className="d-block mx-lg-auto img-fluid"
                             alt="Bootstrap Themes"
                             width="700" height="500" loading="lazy" />
                    </Col>
                    <Col lg={6}>
                        <h1 className="display-5 fw-bold lh-1 mb-3">watch videos with your friends from all
                            platforms</h1>
                        {/*<p className="lead">a new platform continues to be added every day!</p>*/}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                            <Button variant='dark' size='lg' className='px-4 me-md-2 mt-3' onClick={createRoomHandler}>
                                create room
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
            <PageFooter />
            <Modal dialogClassName='w-50' centered show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Create User:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser successCallback={() => {
                        setShowCreate(false);
                        setNewUserCreated(true);
                    }} />
                </Modal.Body>
            </Modal>
            <Modal size={error ? 'lg' : 'sm'} backdrop="static" keyboard={false} centered show={loading}
                   onHide={() => setLoading(false)}>
                <Modal.Header closeButton={!!error}>
                    <Modal.Title>
                        {error ? 'creation failed!' : 'creating...'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error ?
                        <Alert variant="danger">
                            <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                        </Alert>
                        :
                        <div className='d-flex justify-content-center gap-3'>
                            <Spinner animation="grow" variant="secondary" />
                            <Spinner animation="grow" variant="dark" />
                            <Spinner animation="grow" variant="secondary" />
                            <Spinner animation="grow" variant="dark" />
                        </div>
                    }
                </Modal.Body>
            </Modal>
        </>
    );
};

export default LandingPage;
