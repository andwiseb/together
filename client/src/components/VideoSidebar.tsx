import React, { useState } from 'react';
import { ButtonGroup, Card, Tab } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import RoomViewersList from './RoomViewersList';
import { RoomModel } from '../types';
import ChatSection from './ChatSection';
import ChatInputBox from './ChatInputBox';

const VideoSidebar = ({ room }: { room: RoomModel }) => {
    const [viewName, setViewName] = useState<'chat' | 'viewers'>('chat');

    return (
        <Card className='h-100 w-100' style={{ minHeight: '300px' }}>
            <Card.Header className='px-2'>
                <ButtonGroup className='w-100'>
                    <Button onClick={() => setViewName('chat')}
                            variant={viewName === 'chat' ? 'dark' : 'outline-dark'}>Chat</Button>
                    <Button onClick={() => setViewName('viewers')}
                            variant={viewName === 'viewers' ? 'dark' : 'outline-dark'}>Viewers List</Button>
                </ButtonGroup>
            </Card.Header>
            <Card.Body className='p-0'>
                <Tab.Container activeKey={viewName} defaultActiveKey={viewName}>
                    <Tab.Content className='h-100'>
                        <Tab.Pane eventKey="chat" className='h-100'>
                            <ChatSection />
                        </Tab.Pane>
                        <Tab.Pane eventKey="viewers" className='h-100'>
                            <RoomViewersList room={room} />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Card.Body>
            {
                viewName === 'chat' &&
                <Card.Footer className='px-2'>
                  <ChatInputBox room={room} />
                </Card.Footer>
            }
        </Card>
    );
};

export default VideoSidebar;
