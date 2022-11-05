import React, { SyntheticEvent, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/user-service';
import { Alert } from 'react-bootstrap';
import { handleHttpError } from '../services/http-client';

const generateRandUsername = (): string => {
    const prefix = 'user-';
    const rand = Date.now().toString(16).slice(-6);
    return `${prefix}${rand}`;
}

const userService = new UserService();

const CreateUser = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth()!;
    const [value, setValue] = useState<string>(generateRandUsername);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { state } = useLocation();

    useEffect(() => {
        if (user) {
            navigate(state?.path || '/create-room');
        }
    }, [user]);

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        userService.createUser(value)
            .then((user) => {
                setUser(user);
                // navigate('/create-room');
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
                {/*<Form.Label>Username</Form.Label>*/}
                <InputGroup hasValidation style={{ marginBottom: '1rem' }}>
                    <InputGroup.Text>@</InputGroup.Text>
                    <Form.Control
                        size='lg'
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
            <Button variant="dark" type='submit' disabled={loading} size='lg' className='w-100'>
                Join
            </Button>
        </Form>
    );
};

export default CreateUser;
