import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import status from "http-status";

import { AuthContext } from "../contexts/AuthContext";
import { MediaContext } from "../contexts/MediaContext";
import Navbar from "../components/Navbar";
import ChatPanel from "../components/ChatPanel";
import Controls from "../components/Controls";
import Lobby from "../components/Lobby";
import MeetingRoom from "../components/MeetingRoom";
import useWindowWidth from "../utils/WindowWidth";

function VideoMeetComponent() {
  const {
    videoAvailable,
    setVideoAvailable,
    audioAvailable,
    setAudioAvailable,
    video,
    setVideo,
    audio,
    setAudio,
    speakerOn,
    setSpeakerOn,
    copied,
    askForUsername,
    setAskForUsername,
    handleScreen,
    localVideoRef,
    askForAdmit,
    setAskForAdmit,
  } = useContext(MediaContext);

  let canvasRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
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

  return (
    <div className="video-meet-component w-screen h-screen max-h-[100vh] overflow-y-hidden  relative bg-[url('/images/call-bg.avif')]    bg-cover flex flex-col justify-between">
      {askForAdmit === true ? (
        <Lobby />
      ) : (
        // <p>lobby</p>
        <div className="overflow-y-auto">
          <div className="flex gap-4 w-full justify-between rounded-lg p-2 transition-all ease-in-out duration-300">
            <MeetingRoom />
            {windowWidth >= 600 ? <ChatPanel view={"desktop"} /> : null}
          </div>
          <div>{windowWidth < 600 && <ChatPanel view={"mobile"} />}</div>
        </div>
      )}

      <Controls />
    </div>
  );
}

export default VideoMeetComponent;
