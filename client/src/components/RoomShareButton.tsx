import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Overlay, Tooltip } from 'react-bootstrap';

const RoomShareButton = ({ roomLink }: { roomLink?: string }) => {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const shareLink = useMemo(() => window.location.origin + '/' + roomLink, [roomLink]);

    useEffect(() => {
        const h = setTimeout(() => setShow(false), 2500);
        return () => {
            clearTimeout(h);
        };
    }, [show]);

    return (
        <>
            <CopyToClipboard text={shareLink} onCopy={() => setShow(true)}>
                <Button ref={target} variant="outline-primary" className='flex-shrink-0'>
                    Share!
                </Button>
            </CopyToClipboard>
            <Overlay target={target.current} show={show} placement="bottom">
                {(props) => (
                    <Tooltip id="overlay-example" {...props}>
                        Copied!
                    </Tooltip>
                )}
            </Overlay>
        </>
    );
};

export default RoomShareButton;
