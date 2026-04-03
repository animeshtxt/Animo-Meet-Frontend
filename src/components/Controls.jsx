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
import useAuthStore from "../stores/authStore";
import useMeetingStore from "../stores/meetingStore";
import useMediaStore from "../stores/mediaStore";

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
  const hasInitializedVideo = useRef(false);
  const { meetingCode } = useParams();
  const routeTo = useNavigate();

  const { isGuest, user } = useAuthStore();
  const { isHost, askForAdmit, setAskForAdmit, meetControls } =
    useMeetingStore();

  const {
    videoEnabled,
    setVideoEnabled,
    videoAvailable,
    setVideoAvailable,
    audioEnabled,
    setAudioEnabled,
    audioAvailable,
    setAudioAvailable,
    speakerOn,
    setSpeakerOn,
    showMessages,
    setShowMessages,
    handleScreen,
    socketRef,
    socketIdRef,
    localVideoRef,
    connections,
    usernames,
    admitRequest,
    setConnections,
    setUsernames,
    setAdmitRequest,
    messages,
    addMessage,
    newMessageCount,
    setNewMessageCount,
  } = useMediaStore();

  const handleEndCall = () => {
    try {
      // 1. Disconnect socket
      if (socketRef.current) {
        socketRef.current.emit("leave-call");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      socketIdRef.current = null;

      // 2. Close all peer connections & stop their tracks
      if (connections && Object.keys(connections).length > 0) {
        logger.dev("Closing peer connections");
        Object.values(connections).forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (sender.track) sender.track.stop();
          });
          pc.getReceivers().forEach((receiver) => {
            if (receiver.track) receiver.track.stop();
          });
          pc.close();
        });
      }

      // 3. Stop localVideoRef stream
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        localVideoRef.current.srcObject = null;
      }

      // 4. Stop window.localStream
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
        window.localStream = null;
      }

      // 5. Kill ALL trapped streams from global registry
      if (window.activeStreams && window.activeStreams.length > 0) {
        window.activeStreams.forEach((stream) => {
          stream.getTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.stop();
              logger.dev(`Stopped trapped ${track.kind} track: ${track.id}`);
            }
          });
        });
        window.activeStreams = [];
      }

      // 6. Kill any remaining DOM video elements
      killAllCameraAccess();

      // 7. Reset media store
      const mediaReset = useMediaStore.getState();
      mediaReset.setVideoEnabled(false);
      mediaReset.setVideoAvailable(false);
      mediaReset.setAudioEnabled(false);
      mediaReset.setAudioAvailable(false);
      mediaReset.setSpeakerOn(true);
      mediaReset.setShowMessages(false);
      mediaReset.setNewMessageCount(0);
      mediaReset.setConnections({});
      mediaReset.setUsernames({});
      mediaReset.setAdmitRequest(0);
      mediaReset.clearMessages();
      mediaReset.clearVideos();
      mediaReset.setOriginalVideoTrack(null);
      mediaReset.setOriginalAudioTrack(null);

      // 8. Reset meeting store
      setAskForAdmit(true);
      // useMeetingStore.getState().setMeetingCodeChecked(false);
      useMeetingStore.getState().setLeftMeet(true);
      routeTo(`/${meetingCode}`);
    } catch (e) {
      logger.error("Error ending call:", e);
    }

    // 9. Navigate
    routeTo(`/${meetingCode}`);
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

  // Video toggle effect — ONLY watches videoEnabled
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // No stream = not in a call yet or call ended
    if (!window.localStream) return;

    logger.dev("User toggled video:", videoEnabled);

    // Actual user video toggle
    // Wrap async logic in IIFE (useEffect can't be async)
    (async () => {
      await toggleVideo();

      // Emit with fresh state (toggleVideo may have changed videoAvailable)
      if (socketRef.current) {
        const s = useMediaStore.getState();
        socketRef.current.emit("toggle-media", {
          roomId: meetingCode,
          peerVideoEnabled: s.videoEnabled,
          peerVideoAvailable: s.videoAvailable,
          peerAudioEnabled: s.audioEnabled,
          peerAudioAvailable: s.audioAvailable,
        });
        logger.dev(
          `Emitting toggle-media with videoEnabled ${s.videoEnabled} and videoAvailable ${s.videoAvailable}, audioEnabled ${s.audioEnabled} and audioAvailable ${s.audioAvailable}`,
        );
      }
    })();
  }, [videoEnabled]);

  const toggleVideo = async () => {
    logger.dev("toggleVideo called, videoEnabled:", videoEnabled);
    const currentConnections = useMediaStore.getState().connections;

    // A. TURNING OFF
    if (!videoEnabled) {
      logger.dev("turning off video");

      // 1. Kill all trapped streams in registry
      if (window.activeStreams) {
        window.activeStreams.forEach((stream) => {
          stream.getVideoTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.stop();
              logger.dev(`💀 Killed track: ${track.id}`);
            }
          });
        });
        window.activeStreams = [];
      }

      // 2. Stop & remove video tracks from localStream
      window.localStream.getVideoTracks().forEach((track) => {
        track.stop();
        window.localStream.removeTrack(track);
        logger.dev("removed localStream video Track");
      });

      // Clean up duplicate audio tracks (keep only one)
      const audioTracks = window.localStream.getAudioTracks();
      const audioTracksCount = audioTracks.length;
      audioTracks.forEach((track, i) => {
        if (i < audioTracksCount - 1) {
          track.stop();
          window.localStream.removeTrack(track);
          logger.dev("removed duplicate localStream audio track");
        }
      });

      // 3. Detach from peer connections
      Object.values(currentConnections).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          logger.dev("Replacing video track in peer connection with null");
          sender.replaceTrack(null);
        }
      });
    }

    // B. TURNING ON
    else {
      logger.dev("turning ON video");
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newTrack = newStream.getVideoTracks()[0];

        window.localStream.addTrack(newTrack);
        setVideoAvailable(true);
        setVideoEnabled(true);
        // Re-attach to peer connections
        Object.values(currentConnections).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find(
              (s) =>
                s.track?.kind === "video" ||
                (s.track === null && s.dtmf === null),
            );

          if (sender) {
            sender
              .replaceTrack(newTrack)
              .then(() => logger.dev("Track replaced successfully for peer"))
              .catch((err) => logger.error("Failed to replace track:", err));
          } else {
            logger.warn("No video sender found. May need to renegotiate.");
          }
        });
      } catch (e) {
        logger.error("Failed to restart video", e);
        setVideoAvailable(false);
        setVideoEnabled(false);
      }
    }
  };

  const toggleAudio = () => {
    const audioTrack = window.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);

      // Notify peers about audio change
      if (socketRef.current) {
        socketRef.current.emit("toggle-media", {
          roomId: meetingCode,
          peerVideoEnabled: videoEnabled,
          peerVideoAvailable: videoAvailable,
          peerAudioEnabled: audioTrack.enabled,
          peerAudioAvailable: audioAvailable,
        });
      }
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
            setVideoEnabled(!videoEnabled);
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
        <IconButton onClick={() => setSpeakerOn(!speakerOn)}>
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
              <Badge badgeContent={newMessageCount} color="primary">
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
                                {user[0]?.toUpperCase()}
                              </span>
                              {user === user?.username ? `${user} (you)` : user}
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
