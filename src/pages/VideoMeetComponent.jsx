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

// const socketUrl = import.meta.env.VITE_SOCKET_URL;

// const server_url = socketUrl;
// const peerConfigConnections = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };

function VideoMeetComponent() {
  // const {
  //   setSnackbarOpen,
  //   setSnackbarMsg,
  //   validateToken,
  //   user,
  //   isGuest,
  //   setIsHost,
  //   isHost,
  //   client,
  // } = useContext(AuthContext);

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
  /*
  // let socketRef = useRef();
  // let socketIdRef = useRef();
  // let localVideoRef = useRef();
  // let videoRef = useRef([]);
  // const scrollRef = useRef(null);

  // const [videoAvailable, setVideoAvailable] = useState(true);
  // const [audioAvailable, setAudioAvailable] = useState(true);
  // const [video, setVideo] = useState(true);
  // const [audio, setAudio] = useState(true);
  // const [speakerOn, setSpeakerOn] = useState(true);
  // const [screen, setScreen] = useState();
  // const [screenAvailable, setScreenAvailable] = useState();
  // const [messages, setMessages] = useState([]);
  // const [message, setMessage] = useState("");
  // const [newMessages, setNewMessages] = useState(0);
  // // const [askForUsername, setAskForUsername] = useState(true);
  // const [username, setUsername] = useState("");
  // const [videos, setVideos] = useState([]);
  // const [usernames, setUsernames] = useState({});
  // // const [showModal, setShowModal] = useState(false);
  // // const [showInfo, setShowInfo] = useState(false);
  // // const [anchorEl, setAnchorEl] = useState(null);
  // const [isFirstRender, setIsFirstRender] = useState(true);
  // //for info panel
  // const [openDrawer, setOpenDrawer] = useState(false);
  // const [value, setValue] = useState("0");
  // const [checkedOne, setCheckedOne] = useState(true);
  // const [checkedTwo, setCheckedTwo] = useState(true);
  // const [checkedThree, setCheckedThree] = useState(true);
  // const [leftUsers, setLeftUsers] = useState([]);
  // const [copied, setCopied] = useState(false);
  // const { meetingCode } = useParams();

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };
  // const toggleDrawer = (newOpen) => () => {
  //   setOpenDrawer(newOpen);
  // };

  // const routeTo = useNavigate();

  //EXPORTED
  // const getPermission = async () => {
  //   try {
  //     const mediaTracks = await navigator.mediaDevices.getUserMedia({
   video: true,
  //       audio: true,
  //     });
  //     const finalTracks = [];
  //     const hasVideo = mediaTracks.getVideoTracks().length > 0;
  //     const hasAudio = mediaTracks.getAudioTracks().length > 0;

  //     setVideoAvailable(hasVideo);
  //     setAudioAvailable(hasAudio);
  //     setVideo(hasVideo);
  //     setAudio(hasAudio);

  //     if (hasVideo) {
  //       console.log("Video available");
  //       finalTracks.push(mediaTracks.getVideoTracks()[0]);
  //     } else {
  //       console.log("Video unavailable");

  //       finalTracks.push(black(600, user.name[0]));
  //     }
  //     if (hasAudio) {
  //       console.log("Audio available");

  //       finalTracks.push(mediaTracks.getAudioTracks()[0]);
  //     } else {
  //       console.log("Audio unavailable");

  //       finalTracks.push(silence());
  //     }

  //     const userMediaStream = new MediaStream(finalTracks);
  //     window.localStream = userMediaStream;
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = userMediaStream;
  //       localVideoRef.current
  //         .play()
  //         .catch((err) => console.error("play() failed:", err));
  //       console.log("local video ref set");
  //     }
  //     console.log("Final video tracks:", userMediaStream.getVideoTracks());
  //     console.log(
  //       "Track state:",
  //       userMediaStream.getVideoTracks()[0]?.readyState
  //     );

  //     userMediaStream.getTracks().forEach((track) => {
  //       track.onended = () => {
  //         console.log(`Track of kind ${track.kind} ended`);
  //         if (track.kind === "video") {
  //           setVideoAvailable(false);
  //           setVideo(false);
  //         }
  //         if (track.kind === "audio") {
  //           setAudioAvailable(false);
  //           setAudio(false);
  //         }
  //       };
  //     });

  //     if (navigator.mediaDevices.getDisplayMedia) {
  //       setScreenAvailable(true);
  //     } else {
  //       setScreenAvailable(false);
  //     }
  //   } catch (err) {
  //     console.log(user);
  //     let initial = user.name && user.name.slice(0) !== "" ? user.name[0] : "U";
  //     let blackSilenceStream = new MediaStream([
  //       black(600, initial),
  //       silence(),
  //     ]);
  //     window.localStream = blackSilenceStream;
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = blackSilenceStream;
  //     }
  //     setVideoAvailable(false);
  //     setAudioAvailable(false);
  //     console.log(err);
  //   }
  // };

  // EXPORTED
  // let getUserMediaSuccess = (stream) => {
  //   // console.log(stream);
  //   try {
  //     window.localStream.getTracks().forEach((track) => track.stop());
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   // if(!video){
  //   //   const blackVideoTrack = new black(300, user.name[0]);
  //   //   const audioTrack = stream.getAudioTracks()[0];

  //   // }
  //   window.localStream = stream;
  //   localVideoRef.current.srcObject = stream;
  //   for (let id in connections) {
  //     if (id === socketIdRef.current) continue;

  //     connections[id].addStream(window.localStream);
  //     connections[id].createOffer().then((description) => {
  //       connections[id]
  //         .setLocalDescription(description)
  //         .then(() => {
  //           socketRef.current.emit(
  //             "signal",
  //             id,
  //             JSON.stringify({ sdp: connections[id].localDescription })
  //           );
  //         })
  //         .catch((e) => {
  //           console.log(e);
  //         });
  //     });
  //   }
  //   stream.getTracks().forEach(
  //     (track) =>
  //       (track.onended = () => {
  //         if (track.kind === "video") {
  //           setVideo(false);
  //         }
  //         if (track.kind === "audio") {
  //           setAudio(false);
  //         }
  //         try {
  //           let tracks = localVideoRef.current.srcObject.getTracks();
  //           tracks.forEach((track) => track.stop());
  //         } catch (e) {
  //           console.log(e);
  //         }
  //         let blackSilence = () =>
  //           new MediaStream([black(600, "B"), silence()]);
  //         let stream = blackSilence();
  //         console.log("Line 119 : " + stream);
  //         window.localStream = stream;
  //         localVideoRef.current.srcObject = window.localStream;
  //       })
  //   );
  // };

  // EXPORTED
  // let silence = () => {
  //   const ctx = new AudioContext();
  //   const dst = ctx.createMediaStreamDestination();
  //   const track = dst.stream.getAudioTracks()[0];
  //   track.enabled = false;
  //   return track;
  // };

  // EXPORTED
  // let black = (width = 600, initial = "A") => {
  //   const height = (width * 9) / 16;
  //   let canvas = Object.assign(document.createElement("canvas"), {
  //     width,
  //     height,
  //   });
  //   const ctx = canvas.getContext("2d");
  //   const randomColor = () =>
  //     `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`;

  //   const gradient = ctx.createRadialGradient(
  //     canvas.width / 2, // inner x
  //     canvas.height / 2, // inner y
  //     0, // inner radius
  //     canvas.width / 2, // outer x
  //     canvas.height / 2, // outer y
  //     Math.max(canvas.width, canvas.height) / 1.5 // outer radius
  //   );

  //   // Apply color stops
  //   gradient.addColorStop(0, randomColor()); // center color
  //   gradient.addColorStop(1, randomColor()); // outer color

  //   ctx.fillStyle = "#34393a";
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   // Set text styling
  //   const fontSize = width / 15;
  //   ctx.fillStyle = "white";
  //   ctx.font = `bold ${fontSize}px sans-serif`;
  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";

  //   // Draw the first letter in the center
  //   ctx.fillText(initial.toUpperCase(), width / 2, height / 2);

  //   let stream = canvas.captureStream();
  //   return Object.assign(stream.getVideoTracks()[0], { enabled: true });
  // };

  // EXPORTED
  // let getUserMedia = () => {
  //   if ((video && videoAvailable) || (audio && audioAvailable)) {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: video, audio: audio })
  //       .then((stream) => {
  //         getUserMediaSuccess(stream);
  //       })
  //       .catch((e) => {
  //         console.dir(e);
  //       });
  //   } else {
  //     try {
  //       let tracks = localVideoRef.current.srcObject.getTracks();
  //       tracks.forEach((track) => track.stop());
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // };

  // EXPORTED
  // let getMedia = () => {
  //   // setVideo(videoAvailable);
  //   // setAudio(audioAvailable);
  //   connectToSocketServer();
  // };

  // EXPORTED
  // let gotMessageFromServer = (fromId, message) => {
  //   let signal = typeof message === "string" ? JSON.parse(message) : message;
  //   if (fromId !== socketIdRef.current) {
  //     if (signal.sdp) {
  //       connections[fromId]
  //         .setRemoteDescription(new RTCSessionDescription(signal.sdp))
  //         .then(() => {
  //           if (signal.sdp.type === "offer") {
  //             connections[fromId]
  //               .createAnswer()
  //               .then((description) => {
  //                 connections[fromId]
  //                   .setLocalDescription(description)
  //                   .then(() => {
  //                     socketRef.current.emit(
  //                       "signal",
  //                       fromId,
  //                       JSON.stringify({
  //                         sdp: connections[fromId].localDescription,
  //                       })
  //                     );
  //                   })
  //                   .catch((e) => {
  //                     console.log(e);
  //                   });
  //               })
  //               .catch((e) => {
  //                 console.log(e);
  //               });
  //           }
  //         })
  //         .catch((e) => {
  //           console.log(e);
  //         });
  //     }
  //     if (signal.ice) {
  //       console.log("Received ICE candidate from", fromId, signal.ice);
  //       connections[fromId]
  //         .addIceCandidate(new RTCIceCandidate(signal.ice))
  //         .catch((e) => console.log(e));
  //     }
  //   }
  // };

  // EXPORTED
  // const addMessage = (sender, data, time, socketIdSender) => {
  //   console.log("Received new message : ", sender, data, time, socketIdSender);
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { sender: sender, data: data, time: time },
  //   ]);
  //   if (
  //     socketIdSender !== socketIdRef.current &&
  //     time &&
  //     !isNaN(new Date(time).getTime())
  //   ) {
  //     // setNewMessages((prevMessages) => prevMessages + 1);
  //   }
  // };

  // let connectToSocketServer = () => {
  //   socketRef.current = io.connect(server_url, {
  //     secure: false,
  //   });

  //   socketRef.current.on("signal", gotMessageFromServer);

  //   socketRef.current.on("connect", () => {
  //     socketIdRef.current = socketRef.current.id;
  //     socketRef.current.emit(
  //       "join-call",
  //       window.location.href,
  //       username,
  //       isGuest ? username + " (guest)" : user.name
  //     );
  //     const socketId = socketRef.current.id;
  //     socketRef.current.on("chat-message", addMessage);
  //     socketRef.current.on("user-left", (id, leftUsername) => {
  //       console.log(leftUsername, "left");
  //       setSnackbarMsg({
  //         severity: "error",
  //         message: `${leftUsername} left`,
  //       });
  //       setSnackbarOpen(true);
  //       setUsernames((prevUsernames) => {
  //         const updated = { ...prevUsernames };
  //         delete updated[id];
  //         return updated;
  //       });
  //       // setVideos((prevVideos) =>
  //       //   prevVideos.filter((video) => video.socketId !== id)
  //       // );
  //       setLeftUsers((prev) => [...prev, id]);
  //     });

  //     socketRef.current.on(
  //       "user-joined",
  //       (id, clients, username, name, usernamesMap) => {
  //         if (id !== socketIdRef.current) {
  //           setSnackbarMsg({
  //             severity: "success",
  //             message: `${name ? name : "someone"} joined`,
  //           });
  //           setSnackbarOpen(true);
  //           console.log(`${name ? name : "someone"} joined`);
  //         }

  //         if (usernamesMap) {
  //           setUsernames(usernamesMap);
  //         } else {
  //           setUsernames((prev) => ({ ...prev, [id]: username }));
  //         }
  //         clients.forEach((socketListId) => {
  //           connections[socketListId] = new RTCPeerConnection(
  //             peerConfigConnections
  //           );

  //           connections[socketListId].onicecandidate = (event) => {
  //             if (event.candidate !== null) {
  //               console.log(
  //                 "Sending ICE candidate to",
  //                 socketListId,
  //                 event.candidate
  //               );
  //               socketRef.current.emit(
  //                 "signal",
  //                 socketListId,
  //                 JSON.stringify({ ice: event.candidate })
  //               );
  //             }
  //           };

  //           connections[socketListId].onaddstream = (event) => {
  //             console.log("Received remote stream:", event.stream);

  //             setVideos((prevVideos) => {
  //               // Remove any existing video with this socketId
  //               const filtered = prevVideos.filter(
  //                 (v) => v.socketId !== socketListId
  //               );
  //               // Add the new video with the stream
  //               return [
  //                 ...filtered,
  //                 {
  //                   socketId: socketListId,
  //                   stream: event.stream,
  //                   autoPlay: true,
  //                   playsinline: true,
  //                 },
  //               ];
  //             });
  //             // Optionally update your ref as well
  //             videoRef.current = videos;
  //           };

  //           if (
  //             window.localStream !== undefined &&
  //             window.localStream !== null
  //           ) {
  //             console.log("window.localStream", window.localStream);
  //             connections[socketListId].addStream(window.localStream);
  //           } else {
  //             let blackSilence = (...args) =>
  //               new MediaStream([black(...args), silence()]);
  //             let stream = blackSilence();
  //             console.log("Line 290 : " + stream);
  //             window.localStream = stream;
  //             connections[socketListId].addStream(window.localStream);
  //           }
  //         });
  //         if (id === socketIdRef.current) {
  //           for (let id2 in connections) {
  //             if (id2 === socketIdRef.current) continue;
  //             try {
  //               connections[id2].addStream(window.localStream);
  //             } catch (e) {
  //               console.log(e);
  //             }
  //             connections[id2].createOffer().then((description) => {
  //               connections[id2]
  //                 .setLocalDescription(description)
  //                 .then(() => {
  //                   socketRef.current.emit(
  //                     "signal",
  //                     id2,
  //                     JSON.stringify({
  //                       sdp: connections[id2].localDescription,
  //                     })
  //                   );
  //                 })
  //                 .catch((e) => console.log(e));
  //             });
  //           }
  //         }
  //       }
  //     );
  //   });
  // };

  // useEffect(() => {
  //   if (leftUsers.length === 0) return;

  //   setVideos((prevVideos) =>
  //     prevVideos.filter((video) => !leftUsers.includes(video.socketId))
  //   );

  //   setLeftUsers([]); // Reset after handling
  // }, [leftUsers]);
  // TODO
  // if(isChrome() ===false){
  //   }

  // EXPORTED
  // let connect = async () => {
  //   if (
  //     isGuest &&
  //     (!user.name || user.name.length === 0) &&
  //     (!username || username.length === 0)
  //   ) {
  //     setSnackbarOpen(true);
  //     setSnackbarMsg({
  //       severity: "warning",
  //       message: "Enter name",
  //     });
  //     return;
  //   }
  //   if (isGuest) {
  //     console.log("is a  guest");
  //     user.name
  //       ? setUsername(user.name + " (guest)")
  //       : setUsername(username + " (guest)");
  //   } else {
  //     console.log("not guest");
  //     setUsername(user.name);
  //     try {
  //       const response = await client.get("/meeting/check-host", {
  //         params: { username: user.username, meetingCode },
  //       });
  //       if (response.status === status.OK) {
  //         setIsHost(true);
  //       }
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error("Error checking host:", error);
  //     }
  //   }

  //   setAskForUsername(false);
  //   getMedia();
  // };

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

  // EXPORTED
  // const getDisplayMediaSuccess = (stream) => {
  //   try {
  //     window.localStream.getTracks().forEach((track) => track.stop());
  //     window.localStream = stream;
  //     localVideoRef.current.srcObject = stream;
  //     for (let id in connections) {
  //       if (id === socketIdRef.current) continue;
  //       connections[id].addStream(window.localStream);
  //       connections[id].createOffer().then((description) => {
  //         connections[id]
  //           .setLocalDescription(description)
  //           .then(() => {
  //             socketRef.current.emit(
  //               "signal",
  //               id,
  //               JSON.stringify({ sdp: connections[id].localDescription })
  //             );
  //           })
  //           .catch((e) => console.log(e));
  //       });
  //     }
  //     stream.getTracks().forEach(
  //       (track) =>
  //         (track.onended = () => {
  //           setScreen(false);
  //           try {
  //             let tracks = localVideoRef.current.srcObject.getTracks();
  //             tracks.forEach((track) => track.stop());
  //           } catch (e) {
  //             console.log(e);
  //           }
  //           getUserMedia();
  //         })
  //     );
  //     setScreenAvailable(true);
  //   } catch (e) {
  //     setScreenAvailable(false);
  //     console.log(e);
  //   }
  // };

  // const getDisplayMedia = () => {
  //   if (screen) {
  //     if (navigator.mediaDevices.getDisplayMedia) {
  //       navigator.mediaDevices
  //         .getDisplayMedia({ video: true })
  //         .then(getDisplayMediaSuccess)
  //         .then((stream) => {})
  //         .catch((e) => {
  //           setScreen(false);
  //           setScreenAvailable(false);
  //           console.log(e);
  //         });
  //     }
  //   }
  // };

  // const handleScreen = () => {
  //   setScreen(!screen);
  // };

  // const sendMessage = (message) => {
  //   console.log("Send message called");
  //   socketRef.current.emit("chat-message", username, message, Date.now());
  //   setMessage("");
  // };

  // const handleEndCall = () => {
  //   try {
  //     // Notify server and peers
  //     if (socketRef.current) {
  //       socketRef.current.emit("leave-call");
  //       socketRef.current.disconnect();
  //     }
  //     let tracks = localVideoRef.current.srcObject.getTracks();
  //     tracks.forEach((track) => track.stop());
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   if (isGuest) {
  //     routeTo("/");
  //     return;
  //   }
  //   routeTo("/home");
  // };

  // useEffect(() => {
  //   const isValid = async () => {
  //     const res = await validateToken();
  //     if (res) {
  //       setUsername(user.name);
  //     }
  //   };
  //   isValid();

  //   const validateMeetCode = async () => {
  //     try {
  //       const response = await client.get(`/meeting/check-meet/${meetingCode}`);
  //       if (response.status !== status.OK) {
  //         setSnackbarMsg({ severity: "warning", message: "No such meeting" });
  //         setSnackbarOpen(true);
  //         routeTo("/");
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       if (e.status === status.NOT_FOUND) {
  //         setSnackbarMsg({
  //           severity: "error",
  //           message: `${e.response.data.message}`,
  //         });
  //       } else {
  //         setSnackbarMsg({
  //           severity: "error",
  //           message: `Some error occured : ${e.response.data.message}`,
  //         });
  //       }

  //       setSnackbarOpen(true);
  //       routeTo("/");
  //     }
  //   };

  //   validateMeetCode();
  //   const checkIsHost = async () => {
  //     try {
  //       const response = await client.get("/meeting/check-host", {
  //         params: { username: user.username, meetingCode },
  //       });
  //       if (response.status === status.OK) {
  //         setIsHost(true);
  //       }
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error("Error checking host:", error);
  //     }
  //   };
  //   // checkIsHost();
  //   getPermission();
  // }, []);

  // useEffect(() => {
  //   if (isFirstRender) {
  //     setIsFirstRender(false);
  //     return;
  //   }
  //   let newVideoTrack;
  //   let newAudioTrack;
  //   if (video && videoAvailable) {
  //     newVideoTrack = window.localStream.getVideoTracks()[0];
  //   } else {
  //     console.log(user);
  //     let initial = user.name && user.name.trim() !== "" ? user.name[0] : "U";
  //     // if (isGuest) {
  //     //   initial = "G";
  //     // }

  //     newVideoTrack = black(600, initial);
  //   }
  //   if (audio && audioAvailable) {
  //     newAudioTrack = window.localStream.getAudioTracks()[0];
  //   } else {
  //     newAudioTrack = silence();
  //   }
  //   const finalStream = new MediaStream([newVideoTrack, newAudioTrack]);
  //   if (localVideoRef.current) {
  //     localVideoRef.current.srcObject = finalStream;
  //   } else {
  //     console.log("some error occured on video audio switch");
  //   }
  //   // Replace the tracks in all peer connections
  //   Object.values(connections).forEach((pc) => {
  //     if (!pc.getSenders) return;
  //     try {
  //       const videoSender = pc
  //         .getSenders()
  //         .find((s) => s.track && s.track.kind === "video");
  //       if (videoSender && newVideoTrack) {
  //         videoSender.replaceTrack(newVideoTrack);
  //       }
  //       const audioSender = pc
  //         .getSenders()
  //         .find((s) => s.track && s.track.kind === "audio");

  //       if (audioSender && newAudioTrack) {
  //         audioSender.replaceTrack(newAudioTrack);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   });
  // }, [audio, video]);

  // useEffect(() => {
  //   if (screen !== undefined) {
  //     getDisplayMedia();
  //   }
  // }, [screen]);

  // useEffect(() => {
  //   const el = scrollRef.current;
  //   if (el) {
  //     el.scrollTop = el.scrollHeight;
  //   }
  // }, [messages]);

  // useEffect(() => {
  //   if (showModal) {
  //     setNewMessages(0);
  //   }
  // }, [showModal, newMessages]);
  // function VideoPlayer({ stream, ...props }) {
  //   const ref = useRef();
  //   useEffect(() => {
  //     if (ref.current && stream) {
  //       ref.current.srcObject = stream;
  //     }
  //   }, [stream]);
  //   return (
  //     <video
  //       ref={ref}
  //       autoPlay
  //       {...props}
  //       onMouseEnter={(e) => (e.currentTarget.controls = true)}
  //       onMouseLeave={(e) => (e.currentTarget.controls = false)}
  //       className="aspect-video max-w-[400px]"
  //       style={{
  //         objectFit: "cover",
  //         backgroundColor: "#34393a",
  //         borderRadius: "10px",
  //       }}
  //     />
  //   );
  // }

  // const VideoTile = React.memo(
  //   ({ video, name, muted }) => (
  //     <div key={video.socketId} className="max-w-[400px] rounded-lg">
  //       <VideoPlayer
  //         stream={video.stream}
  //         muted={muted}
  //         className="rounded-lg"
  //       />
  //       <h2 className="text-white text-center">{name}</h2>
  //     </div>
  //   ),
  //   (prev, next) => {
  //     return (
  //       prev.video.stream === next.video.stream &&
  //       prev.name === next.name &&
  //       prev.muted === next.muted
  //     );
  //   }
  // );

  // const handleCopy = async () => {
  //   try {
  //     await navigator.clipboard.writeText(meetingCode);
  //   } catch (err) {
  //     console.error("Copy failed", err);
  //   }
  // };
*/
  return (
    <div className="video-meet-component w-screen h-screen p-4 relative bg-[url('/images/call-bg.avif')]    bg-cover overflow-y-auto">
      {askForAdmit === true ? (
        <Lobby />
      ) : (
        // <p>lobby</p>
        <div className="flex gap-4 w-full justify-between rounded-lg p-2 transition-all ease-in-out duration-300">
          <MeetingRoom />
          <ChatPanel />
        </div>
        // <p>Welcome</p>
      )}

      <Controls />
    </div>
  );
}

export default VideoMeetComponent;
