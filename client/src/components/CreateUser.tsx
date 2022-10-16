import React, { SyntheticEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from "react-router-dom";
import { useUser } from '../contexts/UserContext';

const CreateUser = () => {
    const navigate = useNavigate();
    const { username, setUserName } = useUser();
    const [value, setValue] = useState<string>(username);

    const onFormSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        setUserName(value);
        navigate('/create-room');
    }

    return (
        <Form onSubmit={onFormSubmit}>
            <Form.Group>
                <Form.Label>Username</Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Text>@</InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please choose a username.
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            <Button variant="primary" type='submit' style={{ marginTop: '1rem' }}>
                Enter
            </Button>
        </Form>
    );
};

export default CreateUser;
