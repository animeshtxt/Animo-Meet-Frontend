import io from "socket.io-client";
import { handleReceiveMessage } from "./messageHandler";
import { logger } from "./logger";
const server_url = import.meta.env.VITE_SOCKET_URL;
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

import { black, silence } from "./mediaHandler";

function createSignalHandler({
  connections,
  socketRef,
  socketIdRef,
  setVideos,
  usernamesMap,
  namesMap,
  peerConfigConnections,
  peerStatesRef, // ✅ Add peerStatesRef parameter
}) {
  const iceQueue = {}; // Store candidates that arrive too early

  return function gotMessageFromServer(fromId, message) {
    let signal = typeof message === "string" ? JSON.parse(message) : message;

    if (fromId === socketIdRef.current) return;

    let connection = connections[fromId];

    // If no connection exists and we're receiving an offer, create it now
    // (This happens for answerers who didn't create connection in user-joined)
    if (!connection && signal.sdp && signal.sdp.type === "offer") {
      logger.dev("═══════════════════════════════════════════════════");
      logger.dev("[ANSWERER] Creating connection for:", fromId);
      logger.dev("Received offer, setting up peer connection now");
      logger.dev("═══════════════════════════════════════════════════");

      // Create peer connection
      connection = new RTCPeerConnection(peerConfigConnections);
      connections[fromId] = connection;
      logger.dev("✓ Peer connection created for answerer");

      // Setup ICE handler
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          logger.dev("[ANSWERER ICE] Sending ICE candidate to", fromId);
          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ ice: event.candidate }),
          );
        }
      };
      logger.dev("✓ ICE handler registered for answerer");

      // Track ICE connection state changes
      connection.oniceconnectionstatechange = () => {
        logger.dev(
          `[ANSWERER ICE STATE] ${fromId}:`,
          connection.iceConnectionState,
        );
        if (
          connection.iceConnectionState === "connected" ||
          connection.iceConnectionState === "completed"
        ) {
          logger.dev("✅ ICE connection established for answerer!");
        }
      };

      // Track connection state changes
      connection.onconnectionstatechange = () => {
        logger.dev(
          `[ANSWERER CONNECTION STATE] ${fromId}:`,
          connection.connectionState,
        );
      };

      // Setup ontrack handler - CRITICAL for receiving remote media!
      connection.ontrack = (event) => {
        // Safety check: ensure stream exists
        if (!event.streams || !event.streams[0]) {
          logger.de("[ANSWERER ONTRACK] Event fired but no stream attached");
          return;
        }

        logger.dev("═══════════════════════════════════════════════════");
        logger.dev("🎉 [ANSWERER ONTRACK] Received remote stream from", fromId);
        logger.dev("Stream ID:", event.streams[0].id);
        logger.dev("Audio tracks:", event.streams[0].getAudioTracks().length);
        logger.dev("Video tracks:", event.streams[0].getVideoTracks().length);
        logger.dev("═══════════════════════════════════════════════════");
        setVideos((prev) => {
          const filtered = prev.filter((v) => v.socketId !== fromId);
          return [
            ...filtered,
            {
              socketId: fromId,
              stream: event.streams[0],
              name: namesMap.current[fromId] || "Unknown",
              ...peerStatesRef.current[fromId],
            },
          ];
        });
      };
      logger.dev("✓ ontrack handler registered for answerer");
    }

    if (!connection) return;

    // A. HANDLE SDP (Offer or Answer)
    if (signal.sdp) {
      logger.dev("═══════════════════════════════════════════════════");
      logger.dev("[SDP] Received SDP type:", signal.sdp.type, "from", fromId);
      logger.dev("═══════════════════════════════════════════════════");

      connection
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          logger.dev("✓ Set remote description successfully");

          // Process queued ICE candidates
          if (iceQueue[fromId]) {
            iceQueue[fromId].forEach((c) =>
              connection
                .addIceCandidate(new RTCIceCandidate(c))
                .catch((e) => console.error(e)),
            );
            delete iceQueue[fromId];
          }

          // IF IT IS AN OFFER, WE MUST ANSWER
          if (signal.sdp.type === "offer") {
            logger.dev("[OFFER] Received offer from", fromId);
            const localStream = window.localStream;
            logger.dev("localStream exists when answering: ", !!localStream);

            const transceivers = connection.getTransceivers();
            logger.dev("Transceivers available:", transceivers.length);

            if (localStream) {
              const audioTrack = localStream.getAudioTracks()[0];
              const videoTrack = localStream.getVideoTracks()[0];

              if (audioTrack) {
                const audioTransceiver = transceivers.find(
                  (t) => t.receiver.track.kind === "audio",
                );
                if (audioTransceiver) {
                  audioTransceiver.sender.replaceTrack(audioTrack);
                  logger.dev("✓ Attached audio track in answer");
                }
              }

              if (videoTrack) {
                const videoTransceiver = transceivers.find(
                  (t) => t.receiver.track.kind === "video",
                );
                if (videoTransceiver) {
                  videoTransceiver.sender.replaceTrack(videoTrack);
                  logger.dev("✓ Attached video track in answer");
                }
              }
            } else {
              console.warn("⚠ No localStream when creating answer");
            }

            // CRITICAL FIX: Ensure all transceivers are sendrecv
            // Even if we don't have local tracks, we still want to RECEIVE
            logger.dev("Ensuring transceivers are set to sendrecv...");
            transceivers.forEach((t, i) => {
              logger.dev(`Transceiver ${i} BEFORE:`, {
                kind: t.receiver.track.kind,
                direction: t.direction,
                currentDirection: t.currentDirection,
              });

              // Force direction to sendrecv
              if (t.direction !== "sendrecv") {
                t.direction = "sendrecv";
                logger.dev(
                  `✓ Set transceiver ${i} (${t.receiver.track.kind}) to sendrecv`,
                );
              }
            });

            connection
              .createAnswer()
              .then((description) => {
                logger.dev("[ANSWER] Created answer SDP");
                logger.dev(
                  "Answer includes audio:",
                  description.sdp.includes("m=audio"),
                );
                logger.dev(
                  "Answer includes video:",
                  description.sdp.includes("m=video"),
                );

                // Log actual SDP directions
                logger.dev("Answer SDP directions:");
                const audioMatch = description.sdp.match(
                  /a=sendrecv|a=sendonly|a=recvonly|a=inactive/g,
                );
                if (audioMatch) {
                  logger.dev("SDP direction attributes:", audioMatch);
                }

                connection.setLocalDescription(description).then(() => {
                  logger.dev("[ANSWER] Sending answer to", fromId);
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: connection.localDescription }),
                  );
                });
              })
              .catch((e) => console.error("Create Answer Error", e));
          } else if (signal.sdp.type === "answer") {
            logger.dev("═══════════════════════════════════════════════════");
            logger.dev("📥 [ANSWER RECEIVED] Processing answer from", fromId);
            logger.dev(
              "Answer SDP includes audio:",
              signal.sdp.sdp.includes("m=audio"),
            );
            logger.dev(
              "Answer SDP includes video:",
              signal.sdp.sdp.includes("m=video"),
            );
            logger.dev("Connection state:", connection.connectionState);
            logger.dev("ICE connection state:", connection.iceConnectionState);
            logger.dev("Signaling state:", connection.signalingState);

            // Check transceivers
            const transceivers = connection.getTransceivers();
            logger.dev("Transceivers count:", transceivers.length);
            transceivers.forEach((t, i) => {
              logger.dev(`Transceiver ${i}:`, {
                kind: t.receiver.track.kind,
                direction: t.direction,
                currentDirection: t.currentDirection,
                hasSender: !!t.sender,
                hasReceiver: !!t.receiver,
              });
            });

            // CRITICAL FIX: Manually extract tracks from transceivers
            // Sometimes ontrack fires before the stream is attached
            // So we need to manually create a MediaStream from the receiver tracks
            logger.dev("\n🛠️ Manually extracting tracks from transceivers...");
            const receiverTracks = transceivers
              .map((t) => t.receiver.track)
              .filter((track) => track && track.readyState === "live");

            logger.dev("Receiver tracks found:", receiverTracks.length);
            receiverTracks.forEach((track, i) => {
              logger.dev(`  Track ${i}:`, {
                kind: track.kind,
                id: track.id,
                readyState: track.readyState,
                enabled: track.enabled,
              });
            });

            if (receiverTracks.length > 0) {
              // Create a MediaStream from the tracks
              const remoteStream = new MediaStream(receiverTracks);
              logger.dev(
                "✅ Created MediaStream from receiver tracks:",
                remoteStream.id,
              );
              logger.dev(
                "  Audio tracks:",
                remoteStream.getAudioTracks().length,
              );
              logger.dev(
                "  Video tracks:",
                remoteStream.getVideoTracks().length,
              );

              // Add to videos
              logger.dev("📦 Adding stream to setVideos...");
              setVideos((prev) => {
                const filtered = prev.filter((v) => v.socketId !== fromId);
                return [
                  ...filtered,
                  {
                    socketId: fromId,
                    stream: remoteStream,
                    name: namesMap.current[fromId] || "Unknown",
                    videoEnabled: true,
                    videoAvailable: true,
                    audioEnabled: true,
                    audioAvailable: true,
                  },
                ];
              });
              logger.dev("✅ Stream added to videos!");
            } else {
              console.warn("⚠️ No live receiver tracks found yet");
            }

            logger.dev("═══════════════════════════════════════════════════");
          }
        })
        .catch((e) => console.error("Set Remote Desc Error", e));
    }

    // B. HANDLE ICE
    if (signal.ice) {
      if (!connection.remoteDescription) {
        if (!iceQueue[fromId]) iceQueue[fromId] = [];
        iceQueue[fromId].push(signal.ice);
      } else {
        connection
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.error("ICE Error", e));
      }
    }
  };
}
const connectToSocketServer = (
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
  peerStatesRef,
) => {
  const isSecure =
    server_url.startsWith("https://") || server_url.startsWith("wss://");

  socketRef.current = io.connect(server_url, {
    secure: isSecure,
  });

  // Create a ref to store usernamesMap for signal handler
  const usernamesMapRef = { current: {} };
  const namesMapRef = { current: {} };
  socketRef.current.on(
    "signal",
    createSignalHandler({
      connections,
      socketRef,
      socketIdRef,
      setVideos,
      usernamesMap: usernamesMapRef,
      namesMap: namesMapRef,
      peerConfigConnections,
      peerStatesRef, // ✅ Pass peerStatesRef
    }),
  );

  socketRef.current.on("connect", () => {
    logger.dev("Successfully connected to socket");
    setAskForAdmit(false);
    socketIdRef.current = socketRef.current.id;
    logger.dev(socketIdRef.current);
    socketRef.current.emit("join-call", {
      roomID,
      username: isGuest ? `${user.username}_guest` : user.username,
      name: isGuest ? `${user.name} (Guest)` : user.name,
      audioEnabled: audioEnabled,
      audioAvailable: audioAvailable,
      videoEnabled: videoEnabled,
      videoAvailable: videoAvailable,
    });

    socketRef.current.on("admitted", () => {
      setAskForAdmit(false);
    });
    socketRef.current.on("denied", () => {
      setSnackbarMsg({
        severity: "error",
        message: "Admin denied permission",
      });
      setSnackbarOpen(true);
      logger.info("Admin denied entry");
    });

    socketRef.current.on(
      "chat-message",
      handleReceiveMessage(socketIdRef, setMessages, setNewMessages),
    );
    socketRef.current.on("user-left", (id, leftUsername) => {
      logger.dev(leftUsername, "left");
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
        prevVideos.filter((video) => video.socketId !== id),
      );
    });

    socketRef.current.on(
      "user-joined",
      ({
        id,
        clients,
        username,
        name,
        usernamesMap,
        namesMap,
        peerAudioEnabled,
        peerAudioAvailable,
        peerVideoEnabled,
        peerVideoAvailable,
      }) => {
        logger.dev(
          `Data received in user-joined : \n id: ${id}\n clients: ${JSON.stringify(clients)}\n username: ${username}\n name: ${name}\n usernamesMap: ${JSON.stringify(usernamesMap)}\n audioEnabled: ${peerAudioEnabled}\n audioAvailable: ${peerAudioAvailable}\n videoEnabled: ${peerVideoEnabled}\n videoAvailable: ${peerVideoAvailable}`,
        );
        try {
          // ✅ Store peer states including name
          peerStatesRef.current[id] = {
            audioEnabled: peerAudioEnabled,
            audioAvailable: peerAudioAvailable,
            videoEnabled: peerVideoEnabled,
            videoAvailable: peerVideoAvailable,
            name: name || namesMapRef.current[id] || "Unknown", // ✅ Add name
          };
          if (id !== socketIdRef.current) {
            setSnackbarMsg({
              severity: "success",
              message: `${name ? name : "someone"} joined`,
            });
            setSnackbarOpen(true);
            logger.dev(`${name ? name : "someone"} joined`);
          }

          if (usernamesMap) {
            setUsernames(usernamesMap);
            usernamesMapRef.current = usernamesMap; // Sync to ref for signal handler
          } else {
            setUsernames((prev) => ({ ...prev, [id]: username }));
            usernamesMapRef.current[id] = username; // Sync to ref
          }

          // ✅ Update namesMap from server
          if (namesMap) {
            namesMapRef.current = namesMap; // Sync entire map from server
          } else if (name) {
            namesMapRef.current[id] = name; // Sync individual name
          }

          // Inside socketRef.current.on("user-joined", ...)

          clients.forEach((socketListId) => {
            if (socketListId === socketIdRef.current) return;
            if (connections[socketListId]) return;

            // CRITICAL FIX: Only create connection if I am the NEW user (offerer)
            // Existing users (answerers) will create connection when receiving offer
            const willCreateOffer = id === socketIdRef.current;

            if (!willCreateOffer) {
              // I am an EXISTING user - don't create connection yet
              logger.dev("[PEER CONNECTION SETUP - ANSWERER]");
              logger.dev("Will wait for offer from:", socketListId);
              logger.dev("Connection will be created when offer is received");
              return; // Don't create connection yet
            }

            // If we reach here, I AM the NEW user (offerer)
            logger.dev("[PEER CONNECTION SETUP - OFFERER]");
            logger.dev("Creating connection for:", socketListId);

            // 1. Create Peer Connection
            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections,
            );

            // 2. Setup ICE Handling
            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate) {
                logger.dev(
                  "[OFFERER ICE] Sending ICE candidate to",
                  socketListId,
                );
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }),
                );
              }
            };

            // Track ICE connection state changes
            connections[socketListId].oniceconnectionstatechange = () => {
              logger.dev(
                `[OFFERER ICE STATE] ${socketListId}:`,
                connections[socketListId].iceConnectionState,
              );
              if (
                connections[socketListId].iceConnectionState === "connected" ||
                connections[socketListId].iceConnectionState === "completed"
              ) {
                logger.dev("✅ ICE connection established for offerer!");
              }
            };

            // Track connection state changes
            connections[socketListId].onconnectionstatechange = () => {
              logger.dev(
                `[OFFERER CONNECTION STATE] ${socketListId}:`,
                connections[socketListId].connectionState,
              );
            };

            // 3. Setup Track Handling (Receiving Video)
            connections[socketListId].ontrack = (event) => {
              // Safety check: ensure stream exists
              if (!event.streams || !event.streams[0]) {
                console.warn(
                  "[OFFERER ONTRACK] Event fired but no stream attached",
                );
                return;
              }

              logger.dev("═══════════════════════════════════════════════════");
              logger.dev(
                "🎉 [OFFERER ONTRACK] Received remote stream from",
                socketListId,
              );
              logger.dev("Stream ID:", event.streams[0].id);
              logger.dev(
                "Audio tracks:",
                event.streams[0].getAudioTracks().length,
              );
              logger.dev(
                "Video tracks:",
                event.streams[0].getVideoTracks().length,
              );
              logger.dev("═══════════════════════════════════════════════════");
              setVideos((prev) => {
                const filtered = prev.filter(
                  (v) => v.socketId !== socketListId,
                );
                return [
                  ...filtered,
                  {
                    socketId: socketListId,
                    stream: event.streams[0],
                    // ✅ Use socketListId (the peer's ID), not id (my ID)
                    ...peerStatesRef.current[socketListId],
                  },
                ];
              });
            };
            logger.dev("✓ ontrack handler registered for offerer");

            // 4. Setup transceivers and attach tracks
            const localStream = window.localStream;
            logger.dev("localStream exists:", !!localStream);
            if (localStream) {
              logger.dev("Audio tracks:", localStream.getAudioTracks().length);
              logger.dev("Video tracks:", localStream.getVideoTracks().length);
            }

            // Audio Transceiver
            connections[socketListId].addTransceiver("audio", {
              direction: "sendrecv",
              streams: localStream ? [localStream] : [],
            });

            // Video Transceiver
            connections[socketListId].addTransceiver("video", {
              direction: "sendrecv",
              streams: localStream ? [localStream] : [],
            });

            // Attach tracks if available
            if (localStream) {
              const audioTrack = localStream.getAudioTracks()[0];
              const videoTrack = localStream.getVideoTracks()[0];

              const transceivers = connections[socketListId].getTransceivers();
              logger.dev("Total transceivers:", transceivers.length);

              if (audioTrack) {
                logger.dev("Attempting to attach audio track...");
                const audioTransceiver = transceivers.find(
                  (t) => t.receiver.track.kind === "audio",
                );
                if (audioTransceiver) {
                  audioTransceiver.sender.replaceTrack(audioTrack);
                  logger.dev("✓ Attached audio track to", socketListId);
                }
              }

              if (videoTrack) {
                logger.dev("Attempting to attach video track...");
                const videoTransceiver = transceivers.find(
                  (t) => t.receiver.track.kind === "video",
                );
                if (videoTransceiver) {
                  videoTransceiver.sender.replaceTrack(videoTrack);
                  logger.dev("✓ Attached video track to", socketListId);
                }
              }
            } else {
              console.warn(
                "⚠ No localStream when setting up connection to",
                socketListId,
              );
            }
          });

          if (id === socketIdRef.current) {
            logger.dev(
              "[OFFER CREATION] I am the new user. Initiating offers...",
            );
            for (let id2 in connections) {
              if (id2 === socketIdRef.current) continue;

              connections[id2].createOffer().then((description) => {
                logger.dev("[OFFER] Created offer for", id2);
                logger.dev(
                  "Offer SDP includes audio:",
                  description.sdp.includes("m=audio"),
                );
                logger.dev(
                  "Offer SDP includes video:",
                  description.sdp.includes("m=video"),
                );

                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    logger.dev("[OFFER] Sending offer to", id2);
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({
                        sdp: connections[id2].localDescription,
                      }),
                    );
                  })
                  .catch((e) => logger.dev(e));
              });
            }
          } else {
            logger.dev("id is not my ID");
          }
        } catch (e) {
          logger.dev("Error occured : ", e);
        }
      },
    );
  });
  socketRef.current.on(
    "user-media-update",
    ({
      userId,
      peerVideoEnabled,
      peerVideoAvailable,
      peerAudioEnabled,
      peerAudioAvailable,
    }) => {
      // ✅ Safety check: ensure peer state exists
      if (!peerStatesRef.current[userId]) {
        logger.dev(
          `⚠️ Peer state for ${userId} doesn't exist yet, initializing...`,
        );
        peerStatesRef.current[userId] = {
          audioEnabled: peerAudioEnabled,
          audioAvailable: peerAudioAvailable,
          videoEnabled: peerVideoEnabled,
          videoAvailable: peerVideoAvailable,
          name: "Unknown",
        };
      } else {
        // Update existing peer state
        peerStatesRef.current[userId].audioEnabled = peerAudioEnabled;
        peerStatesRef.current[userId].videoEnabled = peerVideoEnabled;
        peerStatesRef.current[userId].audioAvailable = peerAudioAvailable;
        peerStatesRef.current[userId].videoAvailable = peerVideoAvailable;
      }

      logger.dev(
        `${userId} toggled media to video:${peerVideoEnabled} audio:${peerAudioEnabled}`,
      );
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.socketId === userId
            ? {
                ...video,
                audioEnabled: peerAudioEnabled,
                videoEnabled: peerVideoEnabled,
              }
            : video,
        ),
      );
    },
  );

  socketRef.current.on("connect_error", (err) => {
    console.error("Socket connection failed:", err);
  });
};

export { connectToSocketServer };
