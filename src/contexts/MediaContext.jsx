import { createContext, useContext, useRef } from "react";
import { useState, React } from "react";
import { AuthContext } from "./AuthContext";
const apiUrl = import.meta.env.VITE_API_URL;
export const MediaContext = createContext("");

export function MediaContextProvider({ children }) {
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [screen, setScreen] = useState();
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForAdmit, setAskForAdmit] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [connections, setConnections] = useState({});
  const [usernames, setUsernames] = useState({});
  const [showMessages, setShowMessages] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  //for info panel
  const [openDrawer, setOpenDrawer] = useState(false);
  const [value, setValue] = useState("0");
  const [checkedOne, setCheckedOne] = useState(true);
  const [checkedTwo, setCheckedTwo] = useState(true);
  const [checkedThree, setCheckedThree] = useState(true);
  const { user } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);
  const [admitRequest, setAdmitRequest] = useState(0);
  let localVideoRef = useRef();
  let socketRef = useRef();
  let socketIdRef = useRef();
  let videoRef = useRef([]);
  const originalVideoTrack = useRef(null);
  const originalAudioTrack = useRef(null);

  function handleScreen() {
    setScreen(!screen);
  }

  return (
    <div>
      <MediaContext.Provider
        value={{
          videoAvailable,
          setVideoAvailable,
          audioAvailable,
          setAudioAvailable,
          videoEnabled,
          setVideoEnabled,
          audioEnabled,
          setAudioEnabled,
          speakerOn,
          setSpeakerOn,
          screen,
          setScreen,
          screenAvailable,
          setScreenAvailable,
          messages,
          setMessages,
          message,
          setMessage,
          newMessages,
          setNewMessages,
          askForAdmit,
          setAskForAdmit,
          username,
          setUsername,
          videos,
          setVideos,
          connections,
          setConnections,
          usernames,
          setUsernames,
          showMessages,
          setShowMessages,
          showInfo,
          setShowInfo,
          anchorEl,
          setAnchorEl,
          isFirstRender,
          setIsFirstRender,
          openDrawer,
          setOpenDrawer,
          value,
          setValue,
          checkedOne,
          setCheckedOne,
          checkedTwo,
          setCheckedTwo,
          checkedThree,
          setCheckedThree,
          copied,
          setCopied,
          handleScreen,
          localVideoRef,
          socketRef,
          socketIdRef,
          videoRef,
          admitRequest,
          setAdmitRequest,
          originalVideoTrack,
          originalAudioTrack,
        }}
      >
        {children}
      </MediaContext.Provider>
    </div>
  );
}
