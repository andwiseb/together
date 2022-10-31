import './App.css';
import CreateUser from './components/CreateUser';
import CreateRoom from './components/CreateRoom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RoomView from './components/RoomView';
import RequireAuth from './components/RequireAuth';

function App() {
    return (
        <Router>
            <Container fluid='lg' style={{ marginTop: '1rem' }}>
                <Row className="align-items-center">
                    <Col>
                        <Routes>
                            <Route path='/' element={<CreateUser />} />
                            <Route path='/:link' element={<RequireAuth><RoomView /></RequireAuth>} />
                            <Route path="/create-room" element={<RequireAuth><CreateRoom /></RequireAuth>} />
                            <Route path="/room" element={<RequireAuth><RoomView /></RequireAuth>} />
                        </Routes>
                    </Col>
                </Row>
            </Container>
        </Router>
    )
}

export default App;
