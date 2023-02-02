import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

const PageFooter = () => {
    return (
        <Container>
            <footer className='d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top'>
                <Col md={4} className='d-flex align-items-center'>
                    <span className="mb-3 mb-md-0 text-muted">&copy; 2022 | <a href="https://discord.gg/WkjruB28An">report bug</a></span>
                </Col>
                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                    <li className="ms-3"><a className="text-muted" href="#">
                        <svg className="bi" width="24" height="24">
                            <use xlinkHref="#twitter" />
                        </svg>
                    </a></li>
                    <li className="ms-3"><a className="text-muted" href="#">
                        <svg className="bi" width="24" height="24">
                            <use xlinkHref="#instagram" />
                        </svg>
                    </a></li>
                    <li className="ms-3"><a className="text-muted" href="#">
                        <svg className="bi" width="24" height="24">
                            <use xlinkHref="#facebook" />
                        </svg>
                    </a></li>
                </ul>
            </footer>
        </Container>
    );
};

export default PageFooter;
