import {
  TextField,
  Button,
  IconButton,
  Icon,
  Popover,
  Box,
  Tab,
  Drawer,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamOffOutlined from "@mui/icons-material/VideocamOffOutlined";
import VideocamOutlined from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import Badge from "@mui/material/Badge";

import { MediaContext } from "../contexts/MediaContext";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../contexts/SocketContext";
import { killAllCameraAccess } from "../utils/mediaHandler";
import { logger } from "../utils/logger";

// 1. Global Registry for ALL streams
window.activeStreams = [];

// 2. Wrap the browser's function to "Trap" every new stream
const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
  navigator.mediaDevices,
);

navigator.mediaDevices.getUserMedia = async (constraints) => {
  // A. Call the real function
  const stream = await originalGetUserMedia(constraints);

  // B. TRAP IT: Push to our global list immediately
  window.activeStreams.push(stream);
  logger.dev(
    `🪤 Trapped new stream! Total active: ${window.activeStreams.length}`,
  );

  return stream;
};

function Controls() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [value, setValue] = useState("0");
  const [checkedOne, setCheckedOne] = useState(true);
  const [checkedTwo, setCheckedTwo] = useState(true);
  const [checkedThree, setCheckedThree] = useState(true);
  const [copied, setCopied] = useState(false);
  const hasInitializedMedia = useRef(false);
  const { meetingCode } = useParams();

  const {
    videoEnabled,
    setVideoEnabled,
    videoAvailable,
    setVideoAvailable,
    audioEnabled,
    setAudioEnabled,
    audioAvailable,
    speakerOn,
    setSpeakerOn,
    showMessages,
    setShowMessages,
    askForAdmit,
    handleScreen,
    newMessages,
    socketRef,
    localVideoRef,
    connections,
    usernames,
    admitRequest,
  } = useContext(MediaContext);
  const { isGuest, user, isHost } = useContext(AuthContext);
  const routeTo = useNavigate();

  const handleEndCall = () => {
    try {
      // Notify server and peers
      if (socketRef.current) {
        socketRef.current.emit("leave-call");
        socketRef.current.disconnect();
      }
      // Stop all peer connections
      if (connections && Object.keys(connections).length > 0) {
        logger.dev("Closing peer connections");
        Object.values(connections).forEach((pc) => {
          // Stop all tracks being sent through this peer connection
          pc.getSenders().forEach((sender) => {
            if (sender.track) {
              logger.dev(
                `Stopping ${sender.track.kind} track from peer connection`,
              );
              sender.track.stop();
            }
          });
          pc.close();
        });
      }
      // Stop tracks from localVideoRef (the video element stream)
      if (localVideoRef.current?.srcObject) {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => {
          track.stop();
          logger.dev(`Stopped ${track.kind} track from localVideoRef`);
        });
        localVideoRef.current.srcObject = null;
      }
      // Also stop window.localStream if it exists
      if (window.localStream) {
        let tracks = window.localStream.getTracks();
        tracks.forEach((track) => {
          track.stop();
          logger.dev(`Stopped window.localStream ${track.kind} track`);
        });
        window.localStream = null;
      }
    } catch (e) {
      logger.dev("Error ending call:", e);
    }
    if (isGuest) {
      // routeTo("/");
      window.location.href = "/";
      return;
    }
    // routeTo("/home");
    window.location.href = "/home";
    // window.location.href = `/${meetingCode}`;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingCode);
      setCopied(true);
    } catch (err) {
      logger.dev("Copy failed", err);
    }
  };

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Skip toggleVideo entirely during initial media setup
    // The stream is already created by getPermission, don't modify it
    if (!hasInitializedMedia.current) {
      logger.dev(
        "Initial media setup - marking as initialized, NOT calling toggleVideo",
      );
      hasInitializedMedia.current = true;

      // Still notify socket about initial state
      if (socketRef.current) {
        const roomId = meetingCode;
        socketRef.current.emit("toggle-media", {
          roomId,
          kind: "video",
          status: videoEnabled,
        });
      }
      return;
    }

    // Only reach here for actual user toggle actions
    logger.dev("User toggled video - calling toggleVideo");
    toggleVideo();

    if (!socketRef.current) return;
    const roomId = meetingCode;
    socketRef.current.emit("toggle-media", {
      roomId,
      peerVideoEnabled: videoEnabled,
      peerVideoAvailable: videoAvailable,
      peerAudioEnabled: audioEnabled,
      peerAudioAvailable: audioAvailable,
    });
  }, [videoEnabled, audioEnabled]);

  const toggleVideo = async () => {
    logger.dev("video toggle called");
    // A. IF TURNING OFF
    if (!videoEnabled) {
      logger.dev("turning off video");

      // 1. Loop through the REGISTRY (Kill orphans, ghosts, and current streams)
      if (window.activeStreams) {
        window.activeStreams.forEach((stream) => {
          stream.getVideoTracks().forEach((track) => {
            if (track.kind === "video" && track.readyState === "live") {
              track.stop();
              logger.dev(`💀 Killed track: ${track.id}`);
            }
          });
        });
        // Clear the registry
        window.activeStreams = [];
      }

      // 2. Clear Global Variable (Just in case)
      window.localStream.getVideoTracks().forEach((track) => {
        track.stop();
        window.localStream.removeTrack(track);
        logger.dev("removed localStream video Track");
      });
      const audioTracks = window.localStream.getAudioTracks();
      const audioTracksCount = audioTracks.length;
      audioTracks.forEach((track, i) => {
        if (i < audioTracksCount - 1) {
          track.stop();
          window.localStream.removeTrack(track);
          logger.dev("removed localStream audio track");
        }
      });
      // 3. DETACH FROM PEERS (Crucial for full release)
      // If we don't do this, the PeerConnection might hold a "dead" reference

      Object.values(connections).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          logger.dev("Replacing track in peer connection with null");
          sender.replaceTrack(null); // Tell connection "No more video"
        }
      });
    }

    // B. IF TURNING ON
    else {
      logger.dev("turning ON video");

      try {
        logger.dev("re-requesting hardware access");
        // 1. Re-request Hardware access
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newTrack = newStream.getVideoTracks()[0];

        // 2. Add back to our "Source of Truth" stream
        // window.localStream = new MediaStream();
        window.localStream.addTrack(newTrack);
        setVideoEnabled(true);
        setVideoAvailable(true);

        // 3. Re-attach to Peer Connections (Crucial step for SFU/P2P)
        Object.values(connections).forEach((pc) => {
          // Find the 'Sender' that is currently handling video
          // Note: We check s.track.kind OR if the track is null (which happens if you previously replaced it with null)
          const sender = pc
            .getSenders()
            .find(
              (s) =>
                s.track?.kind === "video" ||
                (s.track === null && s.dtmf === null),
            );
          // Note: s.dtmf check is a hacky way to distinguish video senders from audio senders if track is null,
          // but usually relying on your stored state or just checking s.track.kind === 'video' before stopping is safer.

          if (sender) {
            // A. Replace the track directly (Hot Swap)
            sender
              .replaceTrack(newTrack)
              .then(() => logger.dev("Track replaced successfully for peer"))
              .catch((err) => logger.error("Failed to replace track:", err));
          } else {
            // B. Edge Case: If the connection started as Audio-Only, a Video Sender might not exist.
            // In that specific case, replaceTrack won't work; you must call pc.addTrack() and create a new Offer.
            logger.warn(
              "No video sender found. You may need to renegotiate (createOffer) instead.",
            );
          }
        });
      } catch (e) {
        logger.error("Failed to restart video", e);
        setVideoAvailable(false); // Assume device is gone/denied
      }
    }
  };

  const toggleAudio = () => {
    const audioTrack = window.localStream.getAudioTracks()[0];
    if (audioTrack) {
      // Soft Toggle: Hardware stays on, but we stop sending bits
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <div
      id="controls"
      className="flex gap-[10px] items-center max-h-[50px] w-full justify-center flex-wrap bg-[#00264a]  left-0 p-2 z-[1000]"
    >
      <div>
        <IconButton
          onClick={() => {
            setVideoEnabled((prev) => !prev);
          }}
        >
          <Badge badgeContent={videoAvailable ? 0 : "i"} color="error">
            {videoEnabled === true && videoAvailable === true ? (
              <VideocamOutlined
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
              />
            ) : (
              <VideocamOffOutlined
                sx={{
                  fontSize: "clamp(24px, 2vw, 40px)",
                  color: `${videoAvailable ? "#a61c1c" : "#3f3f3fff"}`,
                }}
              />
            )}
          </Badge>
        </IconButton>
      </div>

      <div>
        <IconButton onClick={() => toggleAudio()}>
          <Badge badgeContent={audioAvailable ? 0 : "i"} color="error">
            {audioEnabled === true && audioAvailable === true ? (
              <MicNoneOutlined
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
              />
            ) : (
              <MicOffOutlinedIcon
                sx={{
                  fontSize: "clamp(24px, 2vw, 40px)",
                  color: `${audioAvailable ? "#a61c1c" : "rgb(117, 117, 117)"}`,
                }}
              />
            )}
          </Badge>
        </IconButton>
      </div>
      <div>
        <IconButton onClick={handleEndCall}>
          <CallEndIcon
            sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "red" }}
          />
        </IconButton>
      </div>
      <div>
        <IconButton onClick={() => setSpeakerOn((prev) => !prev)}>
          {speakerOn ? (
            <VolumeUpOutlinedIcon
              sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
            />
          ) : (
            <VolumeOffOutlinedIcon
              sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "#a61c1c" }}
            />
          )}
        </IconButton>
      </div>
      {askForAdmit === false ? (
        <>
          {/* <div>
            <IconButton onClick={handleScreen}>
              {screen === true ? (
                <ScreenShareOutlinedIcon
                  sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
                />
              ) : (
                <StopScreenShareOutlinedIcon
                  sx={{
                    fontSize: "clamp(24px, 2vw, 40px)",
                    color: "#a61c1c",
                  }}
                />
              )}
            </IconButton>
          </div> */}

          <div>
            <IconButton
              onClick={() => {
                setShowMessages(!showMessages);
              }}
            >
              <Badge badgeContent={newMessages} color="primary">
                <ChatIcon
                  sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
                />
              </Badge>
            </IconButton>
          </div>
          <div>
            <Badge badgeContent={admitRequest} color="primary">
              <IconButton onClick={toggleDrawer(true)}>
                <InfoOutlineIcon
                  sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
                />
              </IconButton>
            </Badge>

            <Drawer
              open={openDrawer}
              onClose={toggleDrawer(false)}
              anchor="right"
              BackdropProps={{
                sx: { backgroundColor: "rgba(255, 255, 255, 0)" }, // adjust the last value for opacity
              }}
              PaperProps={{
                sx: { maxWidth: "80vw", width: "400px" },
              }}
            >
              <Box sx={{ width: "100%", typography: "body1" }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab label="Attendees" value="0" />
                      <Tab
                        label="Control"
                        value="1"
                        sx={{ display: isHost ? "inline-flex" : "none" }}
                      />
                      <Tab label="Joining Info" value="2" />
                    </TabList>
                  </Box>
                  <TabPanel value="0">
                    <ul>
                      {Object.keys(usernames).length !== 0
                        ? Object.values(usernames).map((user, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 justify-start mb-4"
                            >
                              <span className="text-white bg-orange-500 rounded-full h-[30px] w-[30px] flex justify-center items-center ">
                                {user[0].toUpperCase()}
                              </span>
                              {user === user.username ? `${user} (you)` : user}
                            </li>
                          ))
                        : null}
                    </ul>
                  </TabPanel>

                  <TabPanel
                    value="1"
                    sx={{ display: isHost ? "inline-flex" : "none" }}
                  >
                    <Stack direction="column" spacing={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkedOne}
                            onChange={(e) => setCheckedOne(e.target.checked)}
                          />
                        }
                        label="Everyone can turn on mic"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkedTwo}
                            onChange={(e) => setCheckedTwo(e.target.checked)}
                          />
                        }
                        label="Everyone can turn on camera"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkedThree}
                            onChange={(e) => setCheckedThree(e.target.checked)}
                          />
                        }
                        label="Everyone can share screen"
                      />
                    </Stack>
                  </TabPanel>

                  <TabPanel value="2">
                    <TextField
                      value={meetingCode}
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                      <IconButton onClick={handleCopy} color="primary">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </TabPanel>
                </TabContext>
              </Box>
            </Drawer>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Controls;
