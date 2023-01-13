import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useIsInViewport } from '../hooks/useInView';
import { useRoom } from '../contexts/RoomContext';
import { UserModel } from '../types';
import appLogo from '../assets/app_logo.png';

interface MessageModel {
    user: UserModel | null;
    text: string;
    time: string;
}

const TIME_SPAN_BETWEEN_MESSAGES = 120000; // 2min

const ChatSection = () => {
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const { socket } = useSocket()!;
    const { user } = useAuth()!;
    const chatDiv = useRef<HTMLDivElement>(null);
    const isFromMe = useCallback((msg: MessageModel) => {
        return msg.user && msg.user.id === user.id
    }, [user]);
    const isFromRoomBot = useCallback((msg: MessageModel) => {
        return msg.user === null
    }, []);

    const isChatInViewport = useIsInViewport(chatDiv);
    const { setUnreadMessagesCount, userAway } = useRoom()!;

    useLayoutEffect(() => {
        scrollChatToBottom();
    }, [messages]);

    useEffect(() => {
        if (isChatInViewport) {
            setUnreadMessagesCount(0);
        }

        socket.on('message-received', (text: string, user: UserModel, time: string) => {
            const newMessage: MessageModel = { text, user, time };
            if (!isFromRoomBot(newMessage) && (!isChatInViewport || userAway)) {
                setUnreadMessagesCount((prv) => prv + 1);

                if (userAway) {
                    new Notification(`Message from ${user.username}:`, {
                        body: text,
                        icon: appLogo
                    });
                }
            }
            setMessages((prev) => {
                return mergeSameUserMsgs([...prev, newMessage])
            });
        });
        return () => {
            socket.off('message-received');
        };
    }, [isChatInViewport, userAway]);

    const scrollChatToBottom = () => {
        if (chatDiv.current) {
            chatDiv.current.scroll({ top: chatDiv.current.scrollHeight });
        }
    }

    const mergeSameUserMsgs = (src: MessageModel[]): MessageModel[] => {
        const result: MessageModel[] = [];
        src.slice(-100).forEach(msg => {
            const lastMsg = result.slice(-1)[0];
            if (!lastMsg) {
                result.push(msg)
            } else {
                if (lastMsg.user && lastMsg.user.id === msg.user?.id &&
                    (new Date().getTime() - new Date(lastMsg.time).getTime()) < TIME_SPAN_BETWEEN_MESSAGES) {
                    lastMsg.text = lastMsg.text + '\n' + msg.text;
                } else {
                    result.push(msg);
                }
            }
        });
        return result;
    }

    const formatDate = (isoDate: string): string => {
        return new Date(isoDate).toLocaleTimeString(undefined, { timeStyle: 'short' });
    }

    return (
        <div className='h-100 chat-container' ref={chatDiv}>
            <div className='w-100 chat-list'>
                {messages.map((msg, idx) => (
                    isFromRoomBot(msg) ?
                        <Alert key={idx} variant='light' className='px-2 py-1'>
                            <div className='w-100 chat-item-header'>
                                <span className='fst-italic chat-bot-text'>{msg.text}</span>
                                <span className='chat-item-timestamp'>{formatDate(msg.time)}</span>
                            </div>
                        </Alert>
                        :
                        <div key={idx}
                             className={'px-1 chat-item-container' + (isFromMe(msg) ? '' : ' chat-from-other')}>
                            <Alert variant={isFromMe(msg) ? 'dark' : 'secondary'}
                                   className={isFromMe(msg) ?
                                       'px-2 py-1 bg-black text-white' : 'px-2 py-1'}
                                   style={{ maxWidth: '75%', minWidth: '50%' }}>
                                <div className='w-100 chat-item-header gap-2'>
                                    <span className="fw-bold chat-item-text">
                                        {isFromMe(msg) ? 'Me' : msg.user!.username}
                                    </span>
                                    <span className='chat-item-timestamp'>{formatDate(msg.time)}</span>
                                </div>
                                <span className='chat-item-text'>{msg.text}</span>
                            </Alert>
                        </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSection;
