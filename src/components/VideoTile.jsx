import React, { useEffect, useRef, useState } from "react";
import { Avatar, Typography } from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { logger } from "../utils/logger";

const VideoTile = ({
  stream, // MediaStream Object
  name,
  isLocal, // Boolean
  lobby,
  videoEnabled, // State from socket
  videoAvailable, // Hardware status
  audioEnabled, // State from socket
  audioAvailable, // Hardware status
  speakerOn,
}) => {
  const videoRef = useRef(null);
  const [color, setColor] = useState(stringToColor(name || "U"));
  const [gradient, setGradient] = useState(stringToRadialGradient());
  // 1. STREAM ATTACHMENT (The most critical part)
  useEffect(() => {
    logger.dev(
      `Details received in videoTile : \nname = ${name} \n isLocal = ${isLocal} \nvideoEnabled = ${videoEnabled} \nvideoAvailable = ${videoAvailable} \n audioEnabled = ${audioEnabled} \naudioAvailable = ${audioAvailable}`,
    );
    // Safety Check: Do we have a valid element?
    if (!videoRef.current) return;

    // A. If we have a stream, attach it
    if (stream) {
      // Only reset srcObject if it's actually different (prevents flickering)
      if (videoRef.current.srcObject !== stream) {
        console.log(`[VideoTile] Attaching stream ${stream.id} to ${name}`);
        videoRef.current.srcObject = stream;

        // FORCE PLAY: Sometimes browsers block autoplay until interaction
        videoRef.current
          .play()
          .catch((e) => console.error("Autoplay blocked:", e));
      }

      // Update Debug Info (Optional, helps you see what's wrong)
      const vTracks = stream.getVideoTracks();
      const aTracks = stream.getAudioTracks();
    } else {
      // B. No stream? Clear it.
      videoRef.current.srcObject = null;
    }
  }, [stream, name]); // Only re-run if the stream object itself changes

  // 2. HARDWARE CLEANUP (Only for Local User)
  useEffect(() => {
    return () => {
      if (isLocal && videoRef.current && videoRef.current.srcObject) {
        console.log("Cleaning up local tile...");
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isLocal]);

  // Hide video if: Hardware missing OR User disabled it OR No Stream provided
  const shouldShowVideo = videoAvailable && videoEnabled && stream;

  return (
    <div
      className={`video-tile relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 aspect-video w-full  ${lobby && isLocal ? "" : "max-w-[400px]  md:max-w-[min(calc((100%-30px)/2),600px)] "}`}
      style={{ flexShrink: 0 }}
    >
      {/* --- LAYER 1: The Video (ALWAYS RENDERED, JUST HIDDEN) --- */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || !speakerOn} // Always mute yourself
        className={`w-full aspect-video object-cover transition-opacity duration-300 ${
          shouldShowVideo ? "opacity-100" : "opacity-0"
        }`}
        style={{
          display: "block", // Never use display: none, it kills the stream in some browsers!
          // transform: isLocal ? "scaleX(-1)" : "none", // Mirror self
        }}
      />

      {/* --- LAYER 2: The Avatar (Overlay when video is hidden) --- */}
      {!shouldShowVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{
            background: gradient,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: color,
              fontSize: 32,
            }}
          >
            {name ? name[0].toUpperCase() : "U"}
          </Avatar>
        </div>
      )}

      {/* --- LAYER 3: Status Icons --- */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
        <Typography variant="body2" className="text-white font-medium text-sm">
          {isLocal ? name + " (You)" : name}
        </Typography>
        {(!audioEnabled || !audioAvailable) && (
          <MicOffIcon sx={{ fontSize: 16, color: "#ff4444" }} />
        )}
      </div>

      {/* --- LAYER 4: Video Not Available Badge --- */}
      {!videoAvailable && isLocal && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-red-600/90 px-2 py-1 rounded-full">
          <ErrorOutlineIcon sx={{ fontSize: 16, color: "#ffffff" }} />
          <Typography
            variant="caption"
            className="text-white font-medium text-xs"
          >
            No Camera
          </Typography>
        </div>
      )}
    </div>
  );
};

// Helper - Generate darker colors for better contrast with white text
const stringToColor = (name = "User") => {
  // Simple hash function to generate consistent color from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate RGB values in range 0-180 (instead of 0-255) for darker colors
  const r = Math.abs(hash % 180);
  const g = Math.abs((hash >> 8) % 180);
  const b = Math.abs((hash >> 16) % 90);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helper - Generate radial gradient background for avatar container
// Uses random colors (independent of name) but persists via state
const stringToRadialGradient = () => {
  // Generate center color (lighter) - range 80-140 for warmer, visible tones
  const r1 = Math.floor(Math.random() * 60) + 80;
  const g1 = Math.floor(Math.random() * 60) + 80;
  const b1 = Math.floor(Math.random() * 60) + 80;

  // Generate edge color (darker) - 30% of center for strong gradient effect
  const r2 = Math.floor(r1 * 0.3);
  const g2 = Math.floor(g1 * 0.3);
  const b2 = Math.floor(b1 * 0.3);

  const centerColor = `rgb(${r1}, ${g1}, ${b1})`;
  const edgeColor = `rgb(${r2}, ${g2}, ${b2})`;

  return `radial-gradient(circle, ${centerColor} 0%, ${edgeColor} 100%)`;
};

export default VideoTile;
