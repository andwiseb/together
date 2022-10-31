import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';

interface MessageModel {
    user: string;
    text: string;
    time: string;
}

const ChatSection = ({ room }: { room: RoomModel }) => {
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [sending, setSending] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>('');
    const { socket, isConnected, sendMessage } = useSocket()!;
    const { user } = useAuth()!;
    const chatDiv = useRef<HTMLDivElement>(null);
    const isFromMe = useCallback((msg: MessageModel) => {
        return msg.user && msg.user === user.username
    }, []);
    const isFromRoomBot = useCallback((msg: MessageModel) => {
        return msg.user === null
    }, []);

    useLayoutEffect(() => {
        scrollChatToBottom();
    }, [messages]);

    useEffect(() => {
        socket.on('message-received', (text, user, time) => {
            setMessages((prev) => {
                return mergeSameUserMsgs([...prev, { text, user, time }])
            });
        });
        return () => {
            socket.off('message-received');
        };
    }, []);

    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!msg || msg.trim().length === 0) {
            return;
        }
        setSending(true);
        const timestamp = new Date().toISOString();
        sendMessage(room.id, msg.trim(), user.username, timestamp, () => {
            setSending(false);
            setMessages((prev) => {
                return mergeSameUserMsgs([...prev, { text: msg.trim(), user: user.username, time: timestamp }])
            });
            setMsg('');
        });
    }

    const scrollChatToBottom = () => {
        if (chatDiv.current) {
            chatDiv.current.scroll({ top: chatDiv.current.scrollHeight });
        }
    }

    const mergeSameUserMsgs = (src: MessageModel[]): MessageModel[] => {
        const result: MessageModel[] = [];
        src.slice(-10).forEach(msg => {
            const lastMsg = result.slice(-1)[0];
            if (!lastMsg) {
                result.push(msg)
            } else {
                if (lastMsg.user && lastMsg.user === msg.user) {
                    lastMsg.text = lastMsg.text + '\n' + msg.text;
                } else {
                    result.push(msg);
                }
            }
        });
        return result;
    }

    const formatDate = (isoDate: string): string => {
        return new Date(isoDate).toLocaleTimeString();
    }

    return (
        <Card className='h-100 w-100' style={{ width: '300px', minHeight: '300px' }}>
            <Card.Header>Chat:</Card.Header>
            <Card.Body className='p-0'>
                <div className='h-100 chat-container' ref={chatDiv}>
                    <ListGroup className='w-100 chat-list' variant="flush">
                        {messages.map((msg, idx) => (
                            isFromRoomBot(msg) ?
                                <ListGroup.Item key={idx} variant='light' className='px-2 py-1'>
                                    <div className='w-100 chat-item-header'>
                                        <span className='fst-italic chat-item-text'>{msg.text}</span>
                                        <span className='chat-item-timestamp'>{formatDate(msg.time)}</span>
                                    </div>
                                </ListGroup.Item>
                                :
                                <ListGroup.Item key={idx}
                                                variant={isFromMe(msg) ? undefined : 'secondary'}
                                                className='px-2 py-1'>
                                    <div className='w-100 d-flex flex-column'>
                                        <div className='w-100 chat-item-header'>
                                            <span className="fw-bold">{msg.user}</span>
                                            <span className='chat-item-timestamp'>{formatDate(msg.time)}</span>
                                        </div>
                                        <span className='chat-item-text'>{msg.text}</span>
                                    </div>
                                </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Card.Body>
            <Card.Footer className='px-2'>
                <Form onSubmit={onFormSubmit}>
                    <Form.Group>
                        <InputGroup hasValidation>
                            <Form.Control
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                type="text"
                                placeholder="Type anything to chat"
                                required
                                disabled={false}
                            />
                            <Button variant="outline-primary" type='submit'
                                    disabled={sending || !isConnected}>
                                Send
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Card.Footer>
        </Card>
    );
};

export default ChatSection;
