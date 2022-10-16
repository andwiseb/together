import React, { SyntheticEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import { createUser } from '../services/user-service';
import { Alert } from 'react-bootstrap';
import { handleHttpError } from '../services/http-client';

const generateRandUsername = (): string => {
    const prefix = 'user';
    const rand = Date.now().toString(16).slice(-6);
    return `${prefix}${rand}`;
}

const CreateUser = () => {
    const navigate = useNavigate();
    const { username, setUserName } = useUser();
    const [value, setValue] = useState<string>(generateRandUsername);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        createUser(value)
            .then((user) => {
                console.log('user', user);
                setUserName(user.username);
                navigate('/create-room');
            })
            .catch((err) => {
                console.error('error', err);
                setError(handleHttpError(err)?.message || 'Failed to create the user.')
            })
            .finally(() => setLoading(false))
    }

    return (
        <Form onSubmit={onFormSubmit}>
            <Form.Group>
                <Form.Label>Username</Form.Label>
                <InputGroup hasValidation style={{ marginBottom: '1rem' }}>
                    <InputGroup.Text>@</InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        required
                        value={value}
                        disabled={loading}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please choose a username.
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            {error && <Alert variant='danger' style={{ marginTop: '1rem' }}>{error}</Alert>}
            <Button variant="primary" type='submit' disabled={loading}>
                Enter
            </Button>
        </Form>
    );
};

export default CreateUser;
