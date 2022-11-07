import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RoomView from './components/RoomView';
import RequireAuth from './components/RequireAuth';
import LandingPage from './components/LandingPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/:link' element={<RequireAuth><RoomView /></RequireAuth>} />
                <Route path="/room" element={<RequireAuth><RoomView /></RequireAuth>} />
            </Routes>
        </Router>
    )
}

export default App;
