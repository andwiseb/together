import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RoomView from './components/RoomView';
import LandingPage from './components/LandingPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/:link' element={<RoomView />} />
                <Route path="/room" element={<RoomView />} />
            </Routes>
        </Router>
    );
}

export default App;
