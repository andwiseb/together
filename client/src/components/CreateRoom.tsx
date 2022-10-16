import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useUser } from '../contexts/UserContext';
import { useRoom } from '../contexts/RoomContext';
import ReactPlayer from 'react-player'
import Container from 'react-bootstrap/Container';
import { useNavigate, createSearchParams } from 'react-router-dom';

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
    const [urlValidity, setUrlValidity] = useState(false);

    const {} = useRoom();
    const { username } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        setUrlValidity(isValidHttpUrl(url) && ReactPlayer.canPlay(url));
    }, [url])

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        if ((e.currentTarget as HTMLFormElement).checkValidity() && isValidHttpUrl(url)) {
            console.log('form', e);
        }
    }

    const urlChanged = (e: SyntheticEvent) => {
        const value = (e.target as HTMLInputElement).value;
        // if (isValidHttpUrl(value)) {
        setUrl(value);
        // }
    }

    const navigateToRoom = () => {
        navigate({ pathname: '/room', search: createSearchParams({ id: '123' }).toString() })
    }

    return (
        <>
            <h4>Hi: {username}</h4>
            <hr />
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
                {/*<Button variant="primary" type='submit' style={{ marginTop: '1rem' }}>Create Room</Button>*/}
            </Form>
            {urlValidity &&
                <Container className='player-wrapper'>
                  <ReactPlayer className='react-player' url={url} width='100%' height='100%'
                               config={{
                                   facebook: {
                                       attributes: {
                                           'data-height': 540,
                                       },
                                   },
                               }}
                               onClickPreview={navigateToRoom}
                               light controls />
                </Container>}
        </>
    );
};

export default CreateRoom;
