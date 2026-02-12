import { useContext, useEffect, useRef, useState } from "react";
import status from "http-status";

import { TextField, Button } from "@mui/material";

import { MediaContext } from "../contexts/MediaContext";
import { AuthContext } from "../contexts/AuthContext";

import { getPermission } from "../utils/mediaHandler";
import { connectToSocketServer } from "../utils/socketHandler";

import Navbar from "./Navbar";
import VideoTileSelf from "./VideoTile";
import ErrorBoundary from "./ErrorBoundary";
import { useParams } from "react-router-dom";
import { logger } from "../utils/logger";

function Lobby() {
  const {
    user,
    isGuest,
    isHost,
    setIsHost,
    setSnackbarMsg,
    setSnackbarOpen,
    client,
    setUser,
  } = useContext(AuthContext);
  const [guestName, setGuestName] = useState("");
  const [askForGuestName, setAskForGuestName] = useState(
    user.type === "guest" && (!user.name || user.name.length === 0),
  );
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasRequestedPermission = useRef(false);
  const peerStatesRef = useRef({}); // ✅ Create ref for peer media states
  const roomID = useParams().meetingCode;

  const {
    localVideoRef,
    setAskForAdmit,
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
    setMessages,
    setNewMessages,
  } = useContext(MediaContext);

  const { meetingCode } = useParams();

  let connect = async () => {
    if (
      isGuest &&
      (!user.name || user.name.length === 0) &&
      (!guestName || guestName.length === 0)
    ) {
      logger.dev("User details not found in connect");
      setSnackbarOpen(true);
      setSnackbarMsg({
        severity: "warning",
        message: "Enter name",
      });
      return;
    }
    setIsConnecting(true);
  };

  useEffect(() => {
    async function checkHost() {
      if (isGuest && askForGuestName) {
        console.log(guestName, "is a  guest");
        setUser({
          name: `${guestName}`,
          username: `${guestName}`,
          type: "guest",
        });
      } else {
        console.log(user.name, "not guest");
        try {
          const response = await client.get("/meeting/check-host", {
            params: { username: user.username, meetingCode },
          });
          if (response.status === status.OK) {
            setIsHost(true);
          }
          console.log(response.data);
        } catch (error) {
          console.error("Error checking host:", error);
        }
      }
    }
    checkHost();
    console.log("isHost in useEffect : ", isHost);
  }, []);
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
          setMessages,
          setNewMessages,
          setSnackbarMsg,
          setSnackbarOpen,
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
  }, []); // Empty dependency array - only run once on mount
  return (
    <>
      {/* <div> */}
      <Navbar />

      <div className="lobby-container mt-4">
        <h1 className="text-3xl font-bold text-center w-full text-white">
          Enter the Lobby
        </h1>

        <section className="flex flex justify-center items-center flex-wrap h-full ">
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
          <div className="flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold text-center w-full text-white mt-4">
              {user.type === "guest" ? (
                "You are joining as a Guest"
              ) : (
                <>
                  You are joining as{" "}
                  <span className="font-bold text-green-500">{user.name}</span>
                </>
              )}
            </h3>
            <div className="h-16 mt-4 flex justify-start items-center">
              {user.type === "guest" && askForGuestName ? (
                <TextField
                  id="outlined-basic"
                  label="Enter name"
                  variant="outlined"
                  value={user.name}
                  onChange={(e) => {
                    // setGuestName(e.target.value);
                    setUser({
                      ...user,
                      name: `${e.target.value} (guest)`,
                      username: `${e.target.value}_guest`,
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
        </section>
      </div>
      {/* </div> */}
    </>
  );
}

export default Lobby;
