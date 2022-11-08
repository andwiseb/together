import React, { SyntheticEvent, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/user-service';
import { Alert } from 'react-bootstrap';
import { handleHttpError } from '../services/http-client';

interface CreateUsernameProps {
    successCallback?: () => void;
}

const generateRandUsername = (): string => {
    const prefix = 'user-';
    const rand = Date.now().toString(16).slice(-6);
    return `${prefix}${rand}`;
}

const userService = new UserService();

const CreateUser = ({ successCallback }: CreateUsernameProps) => {
    const { user, setUser } = useAuth()!;
    const [value, setValue] = useState<string>(user?.username || generateRandUsername());
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        (user ? userService.updateUsername(user.id, value) : userService.createUser(value))
            .then((user) => {
                setUser(user);
                if (successCallback && typeof successCallback === 'function') {
                    successCallback();
                }
                // navigate('/create-room');
            })
            .catch((err) => {
                console.error('error', err);
                const globalErrMsg = user ? 'Failed to update the username.' : 'Failed to create the user.';
                const errData = handleHttpError(err);
                if (errData && 'code' in errData) {
                    if (errData.code === 'P2002') {
                        setError('Username is already exists.');
                    } else if (errData.code === 'P2025') {
                        setError('User is not exists!');
                    } else {
                        setError(errData.meta?.cause);
                    }
                } else {
                    setError(handleHttpError(err)?.message || globalErrMsg);
                }
            })
            .finally(() => setLoading(false))
    }

    return (
        <Form onSubmit={onFormSubmit}>
            <Form.Group>
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
                {user ? 'Change' : 'Join'}
            </Button>
        </Form>
    );
};

export default CreateUser;
