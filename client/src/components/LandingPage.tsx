import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import bwHeroImage from '../assets/hero_black_white.png';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import CreateUser from './CreateUser';
import PageFooter from './PageFooter';
import PageHeader from './PageHeader';

const LandingPage = () => {
    const [showCreate, setShowCreate] = useState(false);
    const { user } = useAuth()!;
    const navigate = useNavigate();

    const createRoomHandler = () => {
        if (user) {
            navigate('/create-room');
            return;
        }

        setShowCreate(true);
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
                    <CreateUser />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default LandingPage;
