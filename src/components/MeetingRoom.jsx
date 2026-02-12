import React, { useEffect, useRef, useContext, useState, useMemo } from "react";
import { MediaContext } from "../contexts/MediaContext";
import { AuthContext } from "../contexts/AuthContext";
import VideoTile from "./VideoTile";
import ErrorBoundary from "./ErrorBoundary";
import { IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
      className="aspect-video w-full "
      style={{
        objectFit: "cover",
        backgroundColor: "#34393a",
        borderRadius: "10px",
      }}
    />
  );
}

const VideoTileOld = React.memo(
  ({ video, name, muted }) => (
    <div
      key={video.socketId}
      className="max-w-[400px] md:max-w-[600px] rounded-lg w-full"
    >
      <VideoPlayer stream={video.stream} muted={muted} className="rounded-lg" />
      <h2 className="text-white text-center">{name}</h2>
    </div>
  ),
  (prev, next) => {
    return (
      prev.video.stream === next.video.stream &&
      prev.name === next.name &&
      prev.muted === next.muted
    );
  },
);

function MeetingRoom() {
  const {
    videos,
    usernames,
    speakerOn,
    localVideoRef,
    videoEnabled,
    audioEnabled,
    videoAvailable,
    audioAvailable,
    socketIdRef,
  } = useContext(MediaContext);
  const { user } = useContext(AuthContext);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [videosPerPage, setVideosPerPage] = useState(100); // Start with high number (show all)
  const containerRef = useRef(null);
  const [shouldPaginate, setShouldPaginate] = useState(false);

  // Merge local and peer videos into a single unified array
  const allVideos = useMemo(() => {
    const localVideo = {
      stream: window.localStream,
      name: user.name,
      isLocal: true,
      videoAvailable,
      videoEnabled,
      audioAvailable,
      audioEnabled,
      socketId: "local",
    };

    return [...videos, localVideo];
  }, [
    videos,
    user.name,
    videoAvailable,
    videoEnabled,
    audioAvailable,
    audioEnabled,
  ]);

  // Detect actual overflow and calculate videos per page
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;

      // Get actual container measurements
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;

      // Check if content is overflowing
      const isOverflowing = scrollHeight > containerHeight;

      if (!isOverflowing) {
        // No overflow, show all videos
        setShouldPaginate(false);
        setVideosPerPage(100);
        return;
      }

      // Content is overflowing, calculate how many videos fit
      setShouldPaginate(true);

      // Get all video tiles
      const videoTiles = container.querySelectorAll(".video-tile");
      if (videoTiles.length === 0) return;

      // Calculate videos per row based on screen width
      let videosPerRow;
      if (window.innerWidth < 640) {
        videosPerRow = 1;
      } else if (window.innerWidth < 1024) {
        videosPerRow = 2;
      } else {
        videosPerRow = 3;
      }

      // Get single video tile height (including gap)
      const firstTile = videoTiles[0];
      const tileHeight = firstTile.offsetHeight;
      const gap = 10;

      // Calculate how many rows fit in the container
      const rowsPerPage = Math.floor(containerHeight / (tileHeight + gap));

      // Calculate total videos that fit
      const calculatedVideosPerPage = Math.max(
        videosPerRow,
        rowsPerPage * videosPerRow,
      );
      setVideosPerPage(calculatedVideosPerPage);
    };

    // Initial check with delay to ensure DOM is ready
    const timeoutId = setTimeout(checkOverflow, 100);

    // Recalculate on window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [allVideos.length]); // Recalculate when video count changes

  // Calculate pagination
  const totalPages = Math.ceil(allVideos.length / videosPerPage);
  const startIndex = currentPage * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const currentVideos = allVideos.slice(startIndex, endIndex);

  // Reset to first page if current page becomes invalid
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="video-container flex flex-col gap-4 w-full rounded-lg p-2 transition-all ease-in-out duration-300">
      {/* Video Grid */}
      <div
        ref={containerRef}
        className="all-videos flex items-start justify-start gap-[10px] flex-wrap w-full px-2 sm:px-4"
      >
        {currentVideos.map((video) => (
          <ErrorBoundary key={video.socketId}>
            <VideoTile
              stream={video.stream}
              name={video.name}
              isLocal={video.isLocal}
              lobby={false}
              videoEnabled={video.videoEnabled}
              videoAvailable={video.videoAvailable}
              audioEnabled={video.audioEnabled}
              audioAvailable={video.audioAvailable}
              speakerOn={video.isLocal ? false : speakerOn}
            />
          </ErrorBoundary>
        ))}
      </div>

      {/* Pagination Controls */}
      {shouldPaginate && totalPages > 1 && (
        <div
          className="pagination-controls flex items-center justify-center gap-4 py-3 px-6 rounded-full backdrop-blur-md"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <IconButton
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
              "&:disabled": {
                color: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Typography
            variant="body1"
            className="text-white font-medium px-4"
            sx={{
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            Page {currentPage + 1} of {totalPages}
          </Typography>

          <IconButton
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
              "&:disabled": {
                color: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}

export default MeetingRoom;
