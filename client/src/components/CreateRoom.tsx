import React, { SyntheticEvent, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useAuth } from '../contexts/AuthContext';
import ReactPlayer from 'react-player'
import Container from 'react-bootstrap/Container';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { createRoom } from '../services/room-service';
import { getUser } from '../services/user-service';

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
    const [username, setUsername] = useState<string>('');
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setUrlValidity(isValidHttpUrl(url) && ReactPlayer.canPlay(url));
    }, [url]);

    useEffect(() => {
        getUser(user)
            .then((userObj) => setUsername(userObj.username))
            .catch((err) => {
                console.log('load user error', err);
                if (err && (err.status && err.status === 404 || err.response && err.response.status === 404)) {
                    // Clear cached user id
                    setUser('');
                    // Return to home route, create user
                    navigate('/');
                }
            });
    }, [user]);


    /*const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        if ((e.currentTarget as HTMLFormElement).checkValidity() && isValidHttpUrl(url)) {
            console.log('form', e);
        }
    }*/

    const urlChanged = (e: SyntheticEvent) => {
        const value = (e.target as HTMLInputElement).value;
        setUrl(value);
    }

    const navigateToRoom = () => {
        setLoading(true);
        createRoom(url)
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
            <h4>Hi: {username}</h4>
            <hr />
            <Form noValidate>
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
