import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
// import "./App.css";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import VideoMeetComponent from "./pages/VideoMeetComponent";
import Guest from "./pages/Guest";
import Controls from "./components/Controls";

import { AuthProvider } from "./contexts/AuthContext";
import { MediaContextProvider } from "./contexts/MediaContext";
import { SocketContextProvider } from "./contexts/SocketContext";

import AppRoutes from "./components/AppRoutes";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <MediaContextProvider>
            <SocketContextProvider>
              {/* <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/:meetingCode" element={<VideoMeetComponent />} />
                <Route path="/guest" element={<Guest />} />
                <Route path="/control" element={<Controls />} />
              </Routes> */}
              <AppRoutes />
            </SocketContextProvider>
          </MediaContextProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
