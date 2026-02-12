import { logger } from "./logger";

const getPermission = async (
  user,
  setVideoEnabled,
  setVideoAvailable,
  setAudioEnabled,
  setAudioAvailable,
  localVideoRef,
  setScreenAvailable,
) => {
  if (localVideoRef?.current?.srcObject) {
    logger.dev("media already present");
    return;
  }
  logger.dev("=".repeat(60));
  logger.dev("🚀 getPermission() CALLED");
  console.trace("Call stack:");
  logger.dev("getPermission called");
  let tempVideoTrack = null;
  let tempAudioTrack = null;

  try {
    // --- ATTEMPT 1: GET EVERYTHING ---
    logger.dev("🎯 Requesting COMBINED video + audio...");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    logger.dev("✅ Combined request SUCCESS! Tracks:", {
      video: stream.getVideoTracks().length,
      audio: stream.getAudioTracks().length,
    });

    if (stream.getVideoTracks().length > 0)
      tempVideoTrack = stream.getVideoTracks()[0];
    if (stream.getAudioTracks().length > 0)
      tempAudioTrack = stream.getAudioTracks()[0];
  } catch (err) {
    // If we are here, either the user denied one permission, or a device is missing.
    // We must now try to salvage whatever permissions we CAN get individually.
    console.warn(
      "❌ Dual permission request FAILED. Attempting individual requests...",
      err,
    );

    // --- ATTEMPT 2: RECOVER VIDEO ---
    try {
      logger.dev("🎥 Requesting VIDEO only...");
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoStream.getVideoTracks().length > 0) {
        tempVideoTrack = videoStream.getVideoTracks()[0];
        logger.dev("✅ Video request SUCCESS");
      }
    } catch (e) {
      logger.dev("❌ Video explicitly denied or missing:", e);
    }

    // --- ATTEMPT 3: RECOVER AUDIO ---
    try {
      logger.dev("🎤 Requesting AUDIO only...");
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioStream.getAudioTracks().length > 0) {
        tempAudioTrack = audioStream.getAudioTracks()[0];
        logger.dev("✅ Audio request SUCCESS");
      }
    } catch (e) {
      logger.dev("❌ Audio explicitly denied or missing:", e);
    }
  }

  // --- CONSTRUCT FINAL STREAM ---
  // Create an array of valid tracks (filter out nulls)
  const tracks = [tempVideoTrack, tempAudioTrack].filter(
    (track) => track !== null,
  );

  // Safe: new MediaStream([]) creates an empty stream, it does NOT crash.
  const finalStream = new MediaStream(tracks);

  // --- UPDATE STATE ---
  const hasVideo = !!tempVideoTrack;
  const hasAudio = !!tempAudioTrack;

  setVideoAvailable(hasVideo);
  setAudioAvailable(hasAudio);

  // Default the "User Toggle" to match the "Hardware Reality"
  setVideoEnabled(hasVideo);
  setAudioEnabled(hasAudio);

  // --- UPDATE GLOBAL REF & UI ---
  window.localStream = finalStream;
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = window.localStream;
  }

  logger.dev("[MEDIA PERMISSION] Stream created successfully:");
  logger.dev("  - Video tracks:", finalStream.getVideoTracks().length);
  logger.dev("  - Audio tracks:", finalStream.getAudioTracks().length);
  logger.dev("  - window.localStream assigned:", !!window.localStream);
  logger.dev(
    "  - window.localStream video tracks:",
    window.localStream.getVideoTracks().length,
  );
  logger.dev(
    "  - window.localStream audio tracks:",
    window.localStream.getAudioTracks().length,
  );

  // --- ATTACH LISTENERS (Handle Unplugging) ---
  if (tempVideoTrack) {
    tempVideoTrack.onended = () => {
      logger.dev("Video track ended externally");
      setVideoAvailable(false);
      setVideoEnabled(false);
    };
  }

  if (tempAudioTrack) {
    tempAudioTrack.onended = () => {
      logger.dev("Audio track ended externally");
      setAudioAvailable(false);
      setAudioEnabled(false);
    };
  }

  // --- CHECK SCREEN SHARE ---
  // setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
};
let black = (width = 600, initial = "A") => {
  const height = (width * 3) / 4;
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  const ctx = canvas.getContext("2d");
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, // inner x
    canvas.height / 2, // inner y
    0, // inner radius
    canvas.width / 2, // outer x
    canvas.height / 2, // outer y
    Math.max(canvas.width, canvas.height) / 1.5, // outer radius
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
  track.enabled = true;
  return track;
};

const getDisplayMediaSuccess = (
  stream,
  localVideoRef,
  connections,
  socketRef,
  socketIdRef,
  setScreen,
  setScreenAvailable,
) => {
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
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => logger.dev(e));
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
            logger.dev(e);
          }
          getUserMedia();
        }),
    );
    setScreenAvailable(true);
  } catch (e) {
    setScreenAvailable(false);
    logger.dev(e);
  }
};

// A "Nuclear" Helper to kill ALL camera access in this tab
const killAllCameraAccess = () => {
  logger.dev("☢️ NUCLEAR SHUTDOWN INITIATED ☢️");

  // 1. Kill the Global Stream (if it exists)
  if (window.localStream) {
    window.localStream.getTracks().forEach((track) => {
      track.stop();
      logger.dev(`Stopped Global Track: ${track.id}`);
    });
    window.localStream = null;
  }

  // 2. Kill streams attached to ANY <video> element on the page
  // This finds the "Ghosts" hiding in your video tiles
  document.querySelectorAll("video").forEach((videoElem) => {
    if (videoElem.srcObject) {
      const tracks = videoElem.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
        logger.dev(`Stopped DOM Track: ${track.id}`);
      });
      videoElem.srcObject = null; // Detach the dead stream
    }
  });

  logger.dev("✅ Camera Hardware Released");
};

export {
  getPermission,
  // getUserMediaSuccess,
  // getUserMedia,
  getDisplayMediaSuccess,
  black,
  silence,
  killAllCameraAccess,
};
