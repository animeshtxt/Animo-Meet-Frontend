import { useEffect, useRef, useState } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import io from "socket.io-client";
import VideocamOffOutlined from "@mui/icons-material/VideocamOffOutlined";
import VideocamOutlined from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";

const server_url = "http://localhost:8080/";
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
function VideoMeetComponent() {
  let socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState();
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewmessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [connections, setConnections] = useState({});
  const videoRef = useRef([]);

  const getPermission = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
      }
      const hasVideo = userMediaStream.getVideoTracks().length > 0;
      const hasAudio = userMediaStream.getAudioTracks().length > 0;
      setVideoAvailable(hasVideo);
      setAudioAvailable(hasAudio);
      setVideo(hasVideo);
      setAudio(hasAudio);

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
      setVideoAvailable(false);
      setAudioAvailable(false);
      console.dir(err);
    }
  };

  useEffect(() => {
    getPermission();
  }, []);

  let getUserMediaSuccess = (stream) => {
    // console.log(stream);
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
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
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          let stream = blackSilence();
          console.log("Line 119 : " + stream);
          window.localStream = stream;
          localVideoRef.current.srcObject = window.localStream;
        })
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
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

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  let gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);
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
    if (socketIdSender !== socketIdRef.current) {
      setMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {
      secure: false,
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);
      const socketId = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video.socketId !== id)
        );
      });

      socketRef.current.on("user-joined", (id, clients) => {
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

          if (window.localStream !== undefined && window.localStream !== null) {
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
                  socketRef.current.emit("signal", id2),
                    JSON.stringify({ sdp: connections[id2].localDescription });
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  // TODO
  // if(isChrome() ===false){
  //   }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const handleVideo = () => {
    setVideo(!video);
  };

  const handleAudio = () => {
    setAudio(!audio);
  };

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

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  const handleScreen = () => {
    setScreen(!screen);
  };

  const sendMessage = () => {
    socketRef.current.emit("chat-message", username, message, Date.now());
    setMessage("");
  };

  return (
    <div className="video-meet-component w-screen h-screen p-4 relative bg-[#051034]">
      {askForUsername === true ? (
        <div className="lobby-container">
          <h1 className="text-3xl font-bold text-center w-full">
            Enter the Lobby
          </h1>
          <div className="m-[10px]">
            <video ref={localVideoRef} autoPlay muted></video>
          </div>

          <div className="h-16 mt-4 flex justify-start items-center">
            <TextField
              id="outlined-basic"
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              InputProps={{
                style: {
                  height: "50px",
                  padding: "0",
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={connect}
              sx={{ height: "50px", boxSizing: "border-box", marginX: "10px" }}
            >
              Connect
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="m-[10px] absolute  max-h-[200px] rounded bottom-16 left-4">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="max-h-[200px] h-full rounded-xl "
            ></video>
          </div>

          <div className="flex gap-4 w-full justify-between">
            <div>
              <div className="flex items-center justify-center gap-16 flex-wrap">
                {videos.map((video) => {
                  return (
                    <div key={video.socketId} className="max-w-[400px]">
                      <h2>{video.socketId}</h2>
                      <video
                        data-socket={video.socketId}
                        ref={(ref) => {
                          if (ref && video.stream) {
                            ref.srcObject = video.stream;
                          }
                        }}
                        autoPlay
                        className="rounded-lg"
                      ></video>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`chat-room overflow-hidden max-w-[300px] h-[90vh] bg-white transition-[width] duration-300 ease-in-out rounded-xl  ${
                showModal ? "w-88 p-2" : "w-0 p-0"
              }`}
            >
              <h2> Chat</h2>
              <div className="text-white flex flex-col justify-between h-full relative">
                <div className="chat-display max-h-[80%] overflowY-scroll">
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message, index) => {
                      return (
                        <div key={index}>
                          <p className="flex justify-between items-center">
                            <span className="font-bold text-black ">
                              {message.sender}
                            </span>
                            <span className="font-light  text-black text-xs">
                              {message.time
                                ? new Date(message.time).toLocaleTimeString()
                                : ""}
                            </span>
                          </p>
                          <p className="text-black">{message.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex justify-between items-end gap-1 absolute bottom-8 w-full">
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
      <div className="flex gap-4 items-center fixed bottom-2 w-full justify-center">
        <div>
          <IconButton onClick={handleVideo}>
            {video === true ? (
              <VideocamOutlined sx={{ fontSize: "40px", color: "#3160ad" }} />
            ) : (
              <VideocamOffOutlined
                sx={{ fontSize: "40px", color: "#a61c1c" }}
              />
            )}
          </IconButton>
        </div>

        <div>
          <IconButton onClick={handleAudio}>
            {audio === true ? (
              <MicNoneOutlined sx={{ fontSize: "40px", color: "#3160ad" }} />
            ) : (
              <MicOffOutlinedIcon sx={{ fontSize: "40px", color: "#a61c1c" }} />
            )}
          </IconButton>
        </div>
        <div>
          <IconButton onClick={handleScreen}>
            {screen === true ? (
              <ScreenShareOutlinedIcon
                sx={{ fontSize: "40px", color: "#3160ad" }}
              />
            ) : (
              <StopScreenShareOutlinedIcon
                sx={{ fontSize: "40px", color: "#a61c1c" }}
              />
            )}
          </IconButton>
        </div>
        <div>
          <IconButton>
            <CallEndIcon sx={{ fontSize: "40px", color: "red" }} />
          </IconButton>
        </div>
        <div>
          <IconButton
            onClick={() => {
              setShowModal(!showModal);
              console.log(showModal);
            }}
          >
            <ChatIcon sx={{ fontSize: "40px", color: "#3160ad" }} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default VideoMeetComponent;
