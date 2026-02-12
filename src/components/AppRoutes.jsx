// AppRoutes.jsx (or define it in the same file as App)
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // Adjust path as needed

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import VideoMeetComponent from "../pages/VideoMeetComponent";
import Guest from "../pages/Guest";
import Controls from "./Controls";

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-white bg-gray-900">
        Loading Application...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/:meetingCode" element={<VideoMeetComponent />} />
      <Route path="/guest" element={<Guest />} />
      {/* <Route path="/control" element={<Controls />} /> */}
    </Routes>
  );
};

export default AppRoutes;
