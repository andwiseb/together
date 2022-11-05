import React, { SyntheticEvent, useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useAuth } from '../contexts/AuthContext';
import ReactPlayer from 'react-player'
import Container from 'react-bootstrap/Container';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { RoomService } from '../services/room-service';
import Row from 'react-bootstrap/Row';
import PageFooter from './PageFooter';
import PageHeader from './PageHeader';

const isValidHttpUrl = (input: string) => {
    let url;

    try {
        url = new URL(input);
    } catch (_) {
        return false;
    }

    return (url.protocol === "http:" || url.protocol === "https:") && (url.pathname.length > 1) || url.search;
}

const CreateRoom = () => {
    const [url, setUrl] = useState<string>('');
    const [urlValidity, setUrlValidity] = useState<boolean>(false);
    const [, setLoading] = useState<boolean>(false);
    const { user } = useAuth()!;
    const navigate = useNavigate();
    const roomService = new RoomService(user.id);

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
    }

    const urlChanged = (e: SyntheticEvent) => {
        const value = (e.target as HTMLInputElement).value;
        setUrl(value);
        setUrlValidity(isValidHttpUrl(value) && ReactPlayer.canPlay(value));
    }

    const navigateToRoom = () => {
        setLoading(true);
        roomService.createRoom(url)
            .then((res) => {
                console.log('room', res);
                navigate({ pathname: '/room', search: createSearchParams({ id: res.id }).toString() })
            })
            .catch((err) => {
                console.error('error', err);
            })
            .finally(() => setLoading(false));
    }

    return (
        <>
            <PageHeader />
            <Container className='col-xxl-8 px-4'>
                <Row className='flex-lg-row-reverse align-items-center mb-3'>
                    <Form noValidate onSubmit={onFormSubmit}>
                        <Form.Group>
                            <Form.Label>Enter video url:</Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text id="inputGroupPrepend">URL</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="https://facebook.com/watch?v=123456789"
                                    aria-describedby="inputGroupPrepend"
                                    isInvalid={!urlValidity}
                                    onChange={urlChanged}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {
                                        !isValidHttpUrl(url) ? 'Please enter a valid url.' :
                                            !ReactPlayer.canPlay(url) ? 'Video url not supported.' : ''
                                    }
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Row>
                <Row className='player-wrapper' style={{ height: '480px' }}>
                    {urlValidity &&
                        <ReactPlayer className='react-player' url={url} width='100%' height='480px'
                                     config={{
                                         facebook: {
                                             attributes: {
                                                 'data-height': 480,
                                             },
                                         },
                                     }}
                                     onClickPreview={navigateToRoom}
                                     light controls />
                    }
                </Row>
            </Container>
            <PageFooter />
        </>
    );
};

export default CreateRoom;
