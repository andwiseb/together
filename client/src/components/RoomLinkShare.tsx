import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const RoomLinkShare = ({ roomLink }) => {
    const [roomLinkCopied, setRoomLinkCopied] = useState<boolean>(false);
    const shareLink = (window.location.origin + '/' + roomLink)

    return (
        <InputGroup>
            <InputGroup.Text>Share Room link:</InputGroup.Text>
            <Form.Control
                defaultValue={shareLink}
                readOnly
            />
            <CopyToClipboard text={shareLink}
                             onCopy={() => setRoomLinkCopied(true)}>
                <Button variant="outline-secondary">
                    {roomLinkCopied ? 'Copied!' : 'Copy'}
                </Button>
            </CopyToClipboard>
        </InputGroup>
    );
};

export default RoomLinkShare;
