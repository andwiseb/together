import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ChatInputBox = ({ room }: { room: RoomModel }) => {
    const [msg, setMsg] = useState<string>('');
    const [sending, setSending] = useState<boolean>(false);
    const { isConnected, sendMessage } = useSocket()!;
    const { user } = useAuth()!;

    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!msg || msg.trim().length === 0) {
            return;
        }
        setSending(true);
        const timestamp = new Date().toISOString();
        sendMessage(room.id, msg.trim(), user, timestamp, () => {
            setSending(false);
            setMsg('');
        });
    }

    return (
        <div>
            <Form onSubmit={onFormSubmit}>
                <Form.Group>
                    <InputGroup hasValidation>
                        <Form.Control
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            type="text"
                            placeholder="Type message..."
                            required
                            disabled={false}
                        />
                        <Button variant="outline-dark" type='submit'
                                disabled={sending || !isConnected}>
                            Send
                        </Button>
                    </InputGroup>
                </Form.Group>
            </Form>
        </div>
    );
};

export default ChatInputBox;
