import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  TextField,
  Button,
  IconButton,
  Icon,
  Popover,
  Box,
  Tab,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

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

import io from "socket.io-client";

import { AuthContext } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";

const server_url = "http://localhost:8080/";
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function VideoMeetComponent() {
  const { setSnackbarOpen, setSnackbarMsg, validateToken, user, isGuest } =
    useContext(AuthContext);

  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let videoRef = useRef([]);
  let canvasRef = useRef(null);
  const scrollRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [screen, setScreen] = useState();
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [connections, setConnections] = useState({});
  const [usernames, setUsernames] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  //for info panel
  const [openDrawer, setOpenDrawer] = useState(false);
  const [value, setValue] = useState("0");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const routeTo = useNavigate();
  // console.log("user.name", user.name);
  // const handlePopoverOpen = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handlePopoverClose = () => {
  //   setAnchorEl(null);
  // };
  // const open = Boolean(anchorEl);
  // const id = open ? "simple-popover" : undefined;

  const getPermission = async () => {
    try {
      const mediaTracks = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const finalTracks = [];
      const hasVideo = mediaTracks.getVideoTracks().length > 0;
      const hasAudio = mediaTracks.getAudioTracks().length > 0;

      setVideoAvailable(hasVideo);
      setAudioAvailable(hasAudio);
      setVideo(hasVideo);
      setAudio(hasAudio);

      if (hasVideo) {
        finalTracks.push(mediaTracks.getVideoTracks()[0]);
      } else {
        finalTracks.push(black(600, user.name[0]));
      }
      if (hasAudio) {
        finalTracks.push(mediaTracks.getAudioTracks()[0]);
      } else {
        finalTracks.push(silence());
      }

      const userMediaStream = new MediaStream(finalTracks);
      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
        console.log("local video ref set");
      }
      // console.log("LIne 50: videopermission : ");
      // console.dir(videoPermission);
      // console.log("audiopermission : ");
      // console.dir(audioPermission);
      // if (navigator.mediaDevices.getDisplayMedia) {
      //   setScreenAvailable(true);
      // } else {
      //   setScreenAvailable(false);
      // }

      // if (videoAvailable || audioAvailable) {
      //   const userMediaStream = await navigator.mediaDevices.getUserMedia({
      //     video: videoAvailable,
      //     audio: audioAvailable,
      //   });
      //   if (userMediaStream) {
      //     window.localStream = userMediaStream;
      //     if (localVideoRef.current) {
      //       localVideoRef.current.srcObject = userMediaStream;
      //     }
      //   }
      // }

      userMediaStream.getTracks().forEach((track) => {
        track.onended = () => {
          console.log(`Track of kind ${track.kind} ended`);
          if (track.kind === "video") {
            setVideoAvailable(false);
            setVideo(false);
          }
          if (track.kind === "audio") {
            setAudioAvailable(false);
            setAudio(false);
          }
        };
      });

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (err) {
      let blackSilenceStream = new MediaStream([
        black(600, user.name[0]),
        silence(),
      ]);
      window.localStream = blackSilenceStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = blackSilenceStream;
      }
      setVideoAvailable(false);
      setAudioAvailable(false);
      console.dir(err);
    }
  };

  let getUserMediaSuccess = (stream) => {
    // console.log(stream);
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    // if(!video){
    //   const blackVideoTrack = new black(300, user.name[0]);
    //   const audioTrack = stream.getAudioTracks()[0];

    // }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => {
            console.log(e);
          });
      });
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          if (track.kind === "video") {
            setVideo(false);
          }
          if (track.kind === "audio") {
            setAudio(false);
          }
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }
          let blackSilence = () =>
            new MediaStream([black(600, "B"), silence()]);
          let stream = blackSilence();
          console.log("Line 119 : " + stream);
          window.localStream = stream;
          localVideoRef.current.srcObject = window.localStream;
        })
    );
  };

  let silence = () => {
    // let ctx = new AudioContext();
    // let oscillator = ctx.createOscillator();
    // let dst = oscillator.connect(ctx.createMediaStreamDestination());

    // oscillator.start();
    // ctx.resume();
    // return Object.assign(dst.stream.getAudioTracks()[0], { enabled: true });
    const ctx = new AudioContext();
    const dst = ctx.createMediaStreamDestination();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return track;
  };

  let black = ({ width = 600, initial = "A" } = {}) => {
    const height = (width * 3) / 4;
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    const ctx = canvas.getContext("2d");
    const randomColor = () =>
      `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`;

    const gradient = ctx.createRadialGradient(
      canvas.width / 2, // inner x
      canvas.height / 2, // inner y
      0, // inner radius
      canvas.width / 2, // outer x
      canvas.height / 2, // outer y
      Math.max(canvas.width, canvas.height) / 1.5 // outer radius
    );

    // Apply color stops
    gradient.addColorStop(0, randomColor()); // center color
    gradient.addColorStop(1, randomColor()); // outer color

    ctx.fillStyle = "#34393a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Set text styling
    const fontSize = width / 15;
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the first letter in the center
    ctx.fillText(initial.toUpperCase(), width / 2, height / 2);

    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: true });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => {
          getUserMediaSuccess(stream);
        })
        .catch((e) => {
          console.dir(e);
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  let getMedia = () => {
    // setVideo(videoAvailable);
    // setAudio(audioAvailable);
    connectToSocketServer();
  };
  let gotMessageFromServer = (fromId, message) => {
    let signal = typeof message === "string" ? JSON.parse(message) : message;
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
      if (signal.ice) {
        console.log("Received ICE candidate from", fromId, signal.ice);
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };
  const addMessage = (sender, data, time, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, time: time },
    ]);
    if (
      socketIdSender !== socketIdRef.current &&
      time &&
      !isNaN(new Date(time).getTime())
    ) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {
      secure: false,
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit(
        "join-call",
        window.location.href,
        username,
        isGuest ? username : user.name
      );
      const socketId = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id, leftUsername) => {
        console.log(leftUsername, "left");
        setSnackbarMsg({
          severity: "error",
          message: `${leftUsername} left`,
        });
        setSnackbarOpen(true);
        setUsernames((prevUsernames) => {
          const updated = { ...prevUsernames };
          delete updated[id];
          return updated;
        });
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video.socketId !== id)
        );
      });

      socketRef.current.on(
        "user-joined",
        (id, clients, username, name, usernamesMap) => {
          if (id !== socketIdRef.current) {
            setSnackbarMsg({
              severity: "success",
              message: `${name ? name : "someone"} joined`,
            });
            setSnackbarOpen(true);
            console.log(`${name ? name : "someone"} joined`);
          }

          if (usernamesMap) {
            setUsernames(usernamesMap);
          } else {
            setUsernames((prev) => ({ ...prev, [id]: username }));
          }
          clients.forEach((socketListId) => {
            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections
            );

            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate !== null) {
                console.log(
                  "Sending ICE candidate to",
                  socketListId,
                  event.candidate
                );
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            connections[socketListId].onaddstream = (event) => {
              console.log("Received remote stream:", event.stream);
              // let videoExists = videoRef.current.find(
              //   (video) => video.socketId === socketListId
              // );

              // if (videoExists) {
              //   setVideos((videos) => {
              //     const updatedVideos = videos.map((video) =>
              //       video.socketId === socketListId
              //         ? { ...video, stream: event.stream }
              //         : video
              //     );
              //     videoRef.current = updatedVideos;
              //     return updatedVideos;
              //   });
              // } else {
              //   let newVideo = {
              //     socketId: socketListId,
              //     stream: event.stream,
              //     autoPlay: true,
              //     playsinline: true,
              //   };
              // setVideos((videos) => {
              //   const updatedVideos = [...videos, newVideo];
              //   videoRef.current.updatedVideos;
              //   return updatedVideos;
              // });
              // }

              // ------
              setVideos((prevVideos) => {
                // Remove any existing video with this socketId
                const filtered = prevVideos.filter(
                  (v) => v.socketId !== socketListId
                );
                // Add the new video with the stream
                return [
                  ...filtered,
                  {
                    socketId: socketListId,
                    stream: event.stream,
                    autoPlay: true,
                    playsinline: true,
                  },
                ];
              });
              // Optionally update your ref as well
              videoRef.current = videos;
            };

            if (
              window.localStream !== undefined &&
              window.localStream !== null
            ) {
              console.log("window.localStream", window.localStream);
              connections[socketListId].addStream(window.localStream);
            } else {
              // TODO
              let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);
              let stream = blackSilence();
              console.log("Line 290 : " + stream);
              window.localStream = stream;
              connections[socketListId].addStream(window.localStream);
            }
          });
          if (id === socketIdRef.current) {
            for (let id2 in connections) {
              if (id2 === socketIdRef.current) continue;
              try {
                connections[id2].addStream(window.localStream);
              } catch (e) {
                console.log(e);
              }
              connections[id2].createOffer().then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({
                        sdp: connections[id2].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log(e));
              });
            }
          }
        }
      );
    });
  };

  // TODO
  // if(isChrome() ===false){
  //   }

  let connect = () => {
    if (!user.name && !username && username.length === 0) {
      setSnackbarOpen(true);
      setSnackbarMsg({
        severity: "warning",
        message: "Enter username",
      });
      return;
    }
    if (isGuest) {
      console.log("is a  guest");
      setUsername(username + " (guest)");
    } else {
      console.log("not guest");
      setUsername(user.name);
    }

    setAskForUsername(false);
    getMedia();
  };

  // const handleVideo = useCallback(() => {
  //   let newVideoTrack;
  //   if (video) {
  //     // Create black video track
  //     newVideoTrack = black(200, username[0]);
  //     const audioTrack = window.localStream.getAudioTracks()[0];
  //     // Create a MediaStream from these tracks for local preview
  //     const blackStream = new MediaStream([newVideoTrack, audioTrack]);
  //     if (localVideoRef.current && blackStream) {
  //       localVideoRef.current.srcObject = blackStream;
  //     }
  //   } else {
  //     // Restore real video track
  //     newVideoTrack = window.localStream.getVideoTracks()[0];
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = window.localStream;
  //     }
  //   }
  //   // Replace the video track in all peer connections
  //   Object.values(connections).forEach((pc) => {
  //     if (!pc.getSenders) return;
  //     const videoSender = pc
  //       .getSenders()
  //       .find((s) => s.track && s.track.kind === "video");
  //     if (videoSender && newVideoTrack) {
  //       videoSender.replaceTrack(newVideoTrack);
  //     }
  //   });
  //   setVideo(!video);
  // }, [video, username, connections]);

  // const handleAudio = () => {
  //   setAudio(!audio);
  // };

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = stream;
      localVideoRef.current.srcObject = stream;
      for (let id in connections) {
        if (id === socketIdRef.current) continue;
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "singnal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((e) => console.log(e));
        });
      }
      stream.getTracks().forEach(
        (track) =>
          (track.onended = () => {
            setScreen(false);
            try {
              let tracks = localVideoRef.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            } catch (e) {
              console.log(e);
            }
            getUserMedia();
          })
      );
    } catch (e) {
      console.log(e);
    }
  };
  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const handleScreen = () => {
    setScreen(!screen);
  };

  const sendMessage = () => {
    socketRef.current.emit("chat-message", username, message, Date.now());
    setMessage("");
  };

  const handleEndCall = () => {
    try {
      // Notify server and peers
      if (socketRef.current) {
        socketRef.current.emit("leave-call");
        socketRef.current.disconnect();
      }
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    if (isGuest) {
      routeTo("/");
      return;
    }
    routeTo("/home");
  };

  function VideoPlayer({ stream, ...props }) {
    const ref = useRef();
    useEffect(() => {
      if (ref.current && stream) {
        ref.current.srcObject = stream;
      }
    }, [stream]);
    return (
      <video
        ref={ref}
        autoPlay
        {...props}
        onMouseEnter={(e) => (e.currentTarget.controls = true)}
        onMouseLeave={(e) => (e.currentTarget.controls = false)}
      />
    );
  }

  useEffect(() => {
    const isValid = async () => {
      validateToken();
    };
    isValid();

    getPermission();
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    let newVideoTrack;
    let newAudioTrack;
    if (video) {
      newVideoTrack = window.localStream.getVideoTracks()[0];
    } else {
      newVideoTrack = black(200, username[0]);
    }
    if (audio) {
      newAudioTrack = window.localStream.getAudioTracks()[0];
    } else {
      newAudioTrack = silence();
    }
    const finalStream = new MediaStream([newVideoTrack, newAudioTrack]);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = finalStream;
    } else {
      console.log("some error occured on video audio switch");
    }
    // Replace the tracks in all peer connections
    Object.values(connections).forEach((pc) => {
      if (!pc.getSenders) return;
      try {
        const videoSender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (videoSender && newVideoTrack) {
          videoSender.replaceTrack(newVideoTrack);
        }
        const audioSender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "audio");

        if (audioSender && newAudioTrack) {
          audioSender.replaceTrack(newAudioTrack);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [audio, video]);

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (showModal) {
      setNewMessages(0);
    }
  }, [showModal, newMessages]);
  const VideoTile = React.memo(({ video, name, muted }) => (
    <div key={video.socketId} className="max-w-[400px]">
      <VideoPlayer stream={video.stream} muted={muted} className="rounded-lg" />
      <h2 className="text-white text-center">{name}</h2>
    </div>
  ));
  return (
    <div className="video-meet-component w-screen h-screen p-4 relative bg-[url('/images/call-bg.jpg')] bg-cover overflow-y-auto">
      {askForUsername === true ? (
        <>
          <Navbar />

          <div className="lobby-container mt-16">
            <h1 className="text-3xl font-bold text-center w-full text-white">
              Enter the Lobby
            </h1>
            <section className="flex flex-col justify-center items-center flex-wrap h-full ">
              <div className="m-[10px] rounded-lg max-w-[80vw]">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="rounded-lg w-[600px] aspect-video h-auto"
                ></video>
              </div>

              <div className="h-16 mt-4 flex justify-start items-center">
                {isGuest || !username || username === "" ? (
                  <TextField
                    id="outlined-basic"
                    label="Enter name"
                    variant="outlined"
                    value={username}
                    disabled={user.name ? true : false}
                    onChange={(e) => {
                      setUsername(e.target.value);
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
                  sx={{
                    height: "50px",
                    boxSizing: "border-box",
                    marginX: "10px",
                  }}
                >
                  Ask to Join
                </Button>
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-4 w-full justify-between rounded-lg p-2 ">
            <div className="flex items-start justify-start gap-4 flex-wrap w-full mb-24">
              {videos.map((video) => (
                <div key={video.socketId} className="max-w-[400px]">
                  <VideoPlayer
                    stream={video.stream}
                    className="rounded-lg"
                    muted={!speakerOn}
                  />
                  {/* <video ref={video.stream}></video> */}
                  <h2 className="text-white text-center">
                    {usernames[video.socketId] || video.socketId}
                  </h2>
                </div>
              ))}
              <div key={video.socketId} className="max-w-[400px]">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="rounded-lg "
                />
                <h2 className="text-white text-center">
                  {username}
                  {" (you)"}
                </h2>
              </div>
            </div>

            <div
              className={`chat-room overflow-hidden max-w-[300px] h-[70vh] bg-white transition-[width] duration-300 ease-in-out rounded-xl ${
                showModal
                  ? "w-100 min-w-[150px] p-2  border border-black/30 sticky top-4"
                  : "w-0 p-0 "
              }`}
            >
              <h2 className="max-sm:text-xl text-2xl font-bold  "> Chats</h2>
              <hr />
              <div className="text-white flex flex-col justify-between relative mt-1 h-[95%]">
                <div
                  ref={scrollRef}
                  className="chat-display h-[95%] overflow-y-auto"
                >
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message, index) => {
                      return message.time &&
                        !isNaN(new Date(message.time).getTime()) ? (
                        <div
                          key={index}
                          className="border-t my-2 shadow-sm p-1"
                        >
                          <p className="flex justify-between gap-4 items-center">
                            <span className="font-medium text-black ">
                              {message.sender}
                            </span>
                            <span className="text-black">
                              {new Date(message.time).toLocaleTimeString()}
                            </span>
                          </p>
                          <p className="text-black font-normal">
                            {message.data}
                          </p>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex justify-between items-end gap-1 w-full z-99 bg-white mb-4">
                  <TextField
                    id="standard-basic"
                    label="Enter message"
                    variant="standard"
                    multiline
                    maxRows={6}
                    sx={{ width: "100%" }}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{ width: "10px", fontSize: "15px" }}
                    onClick={sendMessage}
                  >
                    <SendIcon />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="flex gap-[10px] items-center fixed bottom-0 w-full justify-center flex-wrap bg-[#00264a]  left-0 p-2">
        <div>
          <IconButton onClick={() => setVideo(!video)}>
            {video === true ? (
              <VideocamOutlined
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
              />
            ) : (
              <VideocamOffOutlined
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "#a61c1c" }}
              />
            )}
          </IconButton>
        </div>

        <div>
          <IconButton onClick={() => setAudio(!audio)}>
            {audio === true ? (
              <MicNoneOutlined
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
              />
            ) : (
              <MicOffOutlinedIcon
                sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "#a61c1c" }}
              />
            )}
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
        {askForUsername === false ? (
          <>
            <div>
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
            </div>
            <div>
              <IconButton onClick={handleEndCall}>
                <CallEndIcon
                  sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "red" }}
                />
              </IconButton>
            </div>
            <div>
              <IconButton
                onClick={() => {
                  setShowModal(!showModal);
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
              <IconButton onClick={toggleDrawer(true)}>
                <InfoOutlineIcon
                  sx={{ fontSize: "clamp(24px, 2vw, 40px)", color: "white" }}
                />
              </IconButton>
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
                        <Tab label="Control" value="1" />
                        <Tab label="Other" value="2" />
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
                                {user === username ? `${user} (you)` : user}
                              </li>
                            ))
                          : null}
                      </ul>
                    </TabPanel>
                    <TabPanel value="1">Item One</TabPanel>
                    <TabPanel value="2">Item Two</TabPanel>
                  </TabContext>
                </Box>
              </Drawer>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default VideoMeetComponent;
