import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import AuthHome from "./pages/Home";
import VideoMeetComponent from "./pages/VideoMeetComponent";
import Guest from "./pages/Guest";
function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/home" element={<AuthHome />} />
            <Route path="/:meetingCode" element={<VideoMeetComponent />} />
            <Route path="/guest" element={<Guest />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
