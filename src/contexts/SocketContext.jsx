import { useState, createContext, useContext, useRef } from "react";
import { MediaContext } from "./MediaContext";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useParams } from "react-router-dom";

const socketUrl = import.meta.env.VITE_SOCKET_URL;

const server_url = socketUrl;
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
// const meetingCode = useParams().meetingCode;

export const SocketContext = createContext("");

export function SocketContextProvider({ children }) {
  const [connections, setConnections] = useState({});

  const { user, isGuest, setSnackbarMsg, setSnackbarOpen } =
    useContext(AuthContext);
  const {
    videos,
    setVideos,
    setMessages,
    localVideoRef,
    socketRef,
    socketIdRef,
    videoRef,
    black,
    silence,
  } = useContext(MediaContext);
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
                        }),
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

  const addMessage = ({ sender, data, time, socketIdSender }) => {
    console.log("🔔 addMessage CALLED!");
    console.log("📨 Received message object:", {
      sender,
      data,
      time,
      socketIdSender,
    });
    console.log("🆔 Current socket ID:", socketIdRef.current);
    console.log("🤔 Is own message?", socketIdSender === socketIdRef.current);

    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        {
          sender: sender,
          data: data,
          time: time,
          socketIdSender: socketIdSender,
        },
      ];
      console.log("✅ Updated messages array:", newMessages);
      return newMessages;
    });

    if (
      socketIdSender !== socketIdRef.current &&
      time &&
      !isNaN(new Date(time).getTime())
    ) {
      console.log(
        "🔔 Incrementing new messages counter (currently commented out)",
      );
      // setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    console.log("connectToSocketServer in socketcontext called");
    socketRef.current = io.connect(server_url, {
      secure: false,
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit(
        "join-call",
        meetingCode,
        user.username,
        user.name,
      );
      const socketId = socketRef.current.id;
      console.log("🔌 Registering 'chat-message' listener...");
      socketRef.current.on("chat-message", addMessage);
      console.log("✅ 'chat-message' listener registered!");
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
        // setVideos((prevVideos) =>
        //   prevVideos.filter((video) => video.socketId !== id)
        // );
        setLeftUsers((prev) => [...prev, id]);
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
              peerConfigConnections,
            );

            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate !== null) {
                console.log(
                  "Sending ICE candidate to",
                  socketListId,
                  event.candidate,
                );
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }),
                );
              }
            };

            connections[socketListId].onaddstream = (event) => {
              console.log("Received remote stream:", event.stream);

              setVideos((prevVideos) => {
                // Remove any existing video with this socketId
                const filtered = prevVideos.filter(
                  (v) => v.socketId !== socketListId,
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
                      }),
                    );
                  })
                  .catch((e) => console.log(e));
              });
            }
          }
        },
      );
    });
  };
  return (
    <div>
      <SocketContext.Provider
        value={{
          connectToSocketServer,
          socketRef,
          socketIdRef,
          videoRef,
        }}
      >
        {children}
      </SocketContext.Provider>
    </div>
  );
}
