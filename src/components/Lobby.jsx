import { useContext, useEffect, useRef, useState } from "react";
import status from "http-status";

import { TextField, Button } from "@mui/material";

import { MediaContext } from "../contexts/MediaContext";
import { AuthContext } from "../contexts/AuthContext";
import useAuthStore from "../stores/authStore";
import useMeetingStore from "../stores/meetingStore";
import useMediaStore from "../stores/mediaStore";

import { getPermission, killAllCameraAccess } from "../utils/mediaHandler";
import { connectToSocketServer } from "../utils/socketHandler";

import Navbar from "./Navbar";
import VideoTileSelf from "./VideoTile";
import ErrorBoundary from "./ErrorBoundary";
import { useNavigate, useParams } from "react-router-dom";
import { logger } from "../utils/logger";
import { client } from "../utils/client";

function Lobby() {
  const { user, setUser, isGuest, addSnackbar } = useAuthStore();
  const { isHost, setIsHost } = useMeetingStore();
  const [guestName, setGuestName] = useState("");
  const [askForGuestName, setAskForGuestName] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasRequestedPermission = useRef(false);
  const peerStatesRef = useRef({}); // ✅ Create ref for peer media states
  const roomID = useParams().meetingCode;
  const routeTo = useNavigate();

  const {
    localVideoRef,
    videoEnabled,
    setVideoEnabled,
    videoAvailable,
    setVideoAvailable,
    audioEnabled,
    setAudioEnabled,
    audioAvailable,
    setAudioAvailable,
    setScreenAvailable,
    socketRef,
    socketIdRef,
    connections,
    setVideos,
    setUsernames,
    addMessage,
    setNewMessageCount,
  } = useMediaStore();
  const { meetingCode } = useParams();
  const { askForAdmit, setAskForAdmit, leftMeet } = useMeetingStore();
  let connect = async () => {
    if (
      isGuest &&
      (!user.name || user.name.length === 0) &&
      (!guestName || guestName.length === 0)
    ) {
      logger.dev("User details not found in connect");
      // setSnackbarOpen(true);
      addSnackbar({
        severity: "warning",
        message: "Enter name",
      });
      return;
    }
    setIsConnecting(true);
  };

  useEffect(() => {
    if (isFirstRender) {
      console.log("First render returning");
      return;
    }
    try {
      if (user && user.username && isConnecting) {
        console.log("Connecting to socket with isHost:", isHost);
        connectToSocketServer(
          socketRef,
          socketIdRef,
          connections,
          user,
          isGuest,
          setVideos,
          setUsernames,
          setAskForAdmit,
          addMessage,
          setNewMessageCount,
          addSnackbar,
          roomID,
          audioEnabled,
          audioAvailable,
          videoEnabled,
          videoAvailable,
          peerStatesRef, // ✅ Pass peerStatesRef
        );
      } else {
        logger.dev("some error in connecting to socket. user : ");
        logger.dev(user);
        logger.dev("isConnecting : ", isConnecting);
      }
    } catch (error) {
      logger.error("Error connecting to socket:", error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnecting]);

  useEffect(() => {
    logger.dev("user in lobby", user);
    if (isGuest && (!user.username || user.username.length === 0)) {
      setAskForGuestName(true);
      logger.dev("Setting afgn to true");
    }
  }, []);

  useEffect(() => {
    if (useMeetingStore.getState().leftMeet) {
      hasRequestedPermission.current = false;
      return;
    }
    // Only request permission once
    if (hasRequestedPermission.current) {
      logger.dev("Permission already requested, skipping");
      return;
    }

    async function fetchPermission() {
      logger.dev("Requesting media permission for user:", user);
      await getPermission(
        user,
        setVideoEnabled,
        setVideoAvailable,
        setAudioEnabled,
        setAudioAvailable,
        localVideoRef,
        setScreenAvailable,
      );
      hasRequestedPermission.current = true;
    }

    logger.dev("Fetching permission");
    fetchPermission();

    if (isFirstRender) {
      setIsFirstRender(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMeetingStore.getState().leftMeet]); // Empty dependency array - only run once on mount
  return (
    <>
      {/* <div> */}
      <Navbar />

      {useMeetingStore.getState().leftMeet ? (
        <div className="flex flex-col items-center justify-center gap-4 flex-grow">
          <h1 className="text-3xl font-bold text-center w-full text-red-500 mt-4">
            You have left the meeting
          </h1>
          <div>
            <Button
              variant="contained"
              onClick={() => {
                useMeetingStore.getState().setLeftMeet(false);
              }}
              sx={{
                height: "50px",
                boxSizing: "border-box",
                marginX: "10px",
                "&.Mui-disabled": {
                  backgroundColor: "#1565c0b5",
                  color: "#e9f1f9b5",
                },
              }}
            >
              Rejoin
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (window.localStream) {
                  window.localStream
                    .getTracks()
                    .forEach((track) => track.stop());
                  window.localStream = null;
                }
                killAllCameraAccess();
                useMeetingStore.getState().setMeetingCode(null);
                useMeetingStore.getState().setMeetingCodeChecked(false);
                routeTo("/home");
              }}
              sx={{
                height: "50px",
                boxSizing: "border-box",
                marginX: "10px",
                "&.Mui-disabled": {
                  backgroundColor: "#1565c0b5",
                  color: "#e9f1f9b5",
                },
              }}
            >
              Back to home
            </Button>
          </div>
        </div>
      ) : (
        <div className="lobby-container mt-4">
          <h1 className="text-3xl font-bold text-center w-full text-white">
            Enter the Lobby
          </h1>

          <section className="flex flex justify-center items-center flex-wrap">
            <div className=" flex justify-center items-center m-[10px] rounded-lg max-w-[700px] w-full mt-4">
              <ErrorBoundary>
                <VideoTileSelf
                  stream={window.localStream}
                  name={user.name}
                  isLocal={true}
                  lobby={true}
                  videoEnabled={videoEnabled}
                  videoAvailable={videoAvailable}
                  audioEnabled={audioEnabled}
                  audioAvailable={audioAvailable}
                />
              </ErrorBoundary>
            </div>
            <div className="flex flex-col justify-center gap-4 items-center">
              {useMeetingStore.getState().leftMeet ? (
                <h3 className="text-xl font-bold text-center w-full text-red-500 mt-4">
                  You have left the meeting
                </h3>
              ) : user.type === "guest" ? (
                <h3 className="text-xl font-bold text-center w-full text-white mt-4">
                  You are joining as a Guest
                </h3>
              ) : (
                <h3 className="text-xl font-bold text-center w-full text-white mt-4">
                  You are joining as{" "}
                  <span className="font-bold text-green-500">{user.name}</span>
                </h3>
              )}
              {/* <h3 className="text-xl font-bold text-center w-full text-white mt-4">
              {user.type === "guest" ? (
                "You are joining as a Guest"
              ) : (
                <>
                  You are joining as{" "}
                  <span className="font-bold text-green-500">{user.name}</span>
                </>
              )}
            </h3> */}
              <div className=" mt-4 flex flex-col gap-4 justify-center items-center">
                {user.type === "guest" ? (
                  <TextField
                    id="outlined-basic"
                    label="Enter name"
                    variant="outlined"
                    value={user.name}
                    onChange={(e) => {
                      // setGuestName(e.target.value);
                      setUser({
                        ...user,
                        name: `${e.target.value}`,
                        username: `${e.target.value}`,
                      });
                    }}
                    sx={{
                      input: { color: "white" }, // input text color
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "white" }, // default border
                        "&:hover fieldset": { borderColor: "#90caf9" }, // on hover
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" }, // on focus
                      },
                      "& .MuiInputLabel-root": { color: "white" }, // label color
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px #23272f inset",
                        WebkitTextFillColor: "white",
                        caretColor: "white",
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "white" }, // label color (alternative)
                    }}
                    InputProps={{
                      style: { color: "white" }, // input text color (alternative)
                    }}
                  />
                ) : null}
                <div>
                  <Button
                    variant="contained"
                    onClick={connect}
                    disabled={isConnecting}
                    sx={{
                      height: "50px",
                      boxSizing: "border-box",
                      marginX: "10px",
                      "&.Mui-disabled": {
                        backgroundColor: "#1565c0b5",
                        color: "#e9f1f9b5",
                      },
                    }}
                  >
                    {isConnecting ? "Connecting..." : isHost ? "Start" : "Join"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* </div> */}
    </>
  );
}

export default Lobby;
