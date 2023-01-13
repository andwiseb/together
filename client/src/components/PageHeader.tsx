import React from 'react';
import Container from 'react-bootstrap/Container';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PageHeader = () => {
    const { user } = useAuth()!;

    return (
        <Container>
            <header
                className='d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom'>
                <Link to="/"
                   className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <span className="fs-4">fun2g</span>
                </Link>
                <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                    <li>hey <strong>{user ? user.username : 'guest'}</strong>! 🖤</li>
                </ul>
            </header>
        </Container>
    );
};

export default PageHeader;
