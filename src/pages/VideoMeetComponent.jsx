import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextField, Button } from "@mui/material";

import status from "http-status";

import { AuthContext } from "../contexts/AuthContext";
import { MediaContext } from "../contexts/MediaContext";

import useAuthStore from "../stores/authStore.js";
import useMeetingStore from "../stores/meetingStore.js";

import Navbar from "../components/Navbar";
import ChatPanel from "../components/ChatPanel";
import Controls from "../components/Controls";
import Lobby from "../components/Lobby";
import MeetingRoom from "../components/MeetingRoom";
import useWindowWidth from "../utils/WindowWidth";
function VideoMeetComponent() {
  const {
    meetingCode,
    isHost,
    setMeetingCode,
    checkMeetingCode,
    meetingCodeChecked,
    setMeetingCodeChecked,
    askForAdmit,
    setAskForAdmit,
    meetExists,
    leftMeet,
    // checkHost,
  } = useMeetingStore();
  const { meetingCode: urlMeetingCode } = useParams();
  const { user, token, isGuest } = useAuthStore();

  let canvasRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const routeTo = useNavigate();

  useEffect(() => {
    if (!meetingCodeChecked) {
      setMeetingCode(urlMeetingCode);
      checkMeetingCode(urlMeetingCode);
    }
    // Handler function to update the state
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call the handler once initially to set the initial value
    handleResize();

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return meetingCodeChecked !== true ? (
    <div className="flex justify-center items-center w-screen h-screen bg-[url('/images/call-bg.avif')] bg-cover text-white">
      Checking meeting...
    </div>
  ) : meetExists !== true ? (
    <div className="flex flex-col gap-8 justify-center items-center w-screen h-screen bg-[url('/images/call-bg.avif')] bg-cover text-white text-xl ">
      <p className="text-center d-block">
        Meeting with code{" "}
        <span className="font-bold text-green-500 mx-2">{meetingCode} </span>{" "}
        not found, please check the code and try again
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setMeetingCodeChecked(false);
          setMeetingCode("");
          routeTo("/home");
        }}
      >
        Back to Home
      </Button>
    </div>
  ) : (
    <div className="video-meet-component w-screen h-screen max-h-[100vh] overflow-y-hidden  relative bg-[url('/images/call-bg.avif')]    bg-cover flex flex-col justify-between">
      {askForAdmit === true ? (
        <Lobby />
      ) : (
        // <p>lobby</p>
        <div className="overflow-y-auto flex flex-grow relative">
          <div className="flex gap-4 w-full rounded-lg p-2 transition-all ease-in-out duration-300 overflow-y-auto">
            <MeetingRoom />
            {windowWidth >= 600 ? <ChatPanel view={"desktop"} /> : null}
          </div>
          {windowWidth < 600 && <ChatPanel view={"mobile"} />}
        </div>
      )}

      {!useMeetingStore.getState().leftMeet && <Controls />}
    </div>
  );
}

export default VideoMeetComponent;
