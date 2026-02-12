import { useContext, useEffect, useRef, useState } from "react";
import { TextField, Button, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { MediaContext } from "../contexts/MediaContext";
import { AuthContext } from "../contexts/AuthContext";

export default function ChatPanel({ view }) {
  const scrollRef = useRef();
  const [message, setMessage] = useState("");
  const { showMessages, setShowMessages, socketRef, messages, setNewMessages } =
    useContext(MediaContext);
  const { user } = useContext(AuthContext);

  // Scroll to bottom on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (showMessages) {
      setNewMessages(0);
    }
  }, [showMessages, messages]);

  const handleSendMessage = () => {
    if (message.trim() === "") {
      return;
    }
    sendMessage(message);
    console.log("message sent");

    setMessage("");
  };
  const sendMessage = (message) => {
    console.log("Send message called");
    socketRef.current.emit("chat-message", user.name, message, Date.now());
    setMessage("");
  };

  // Desktop mode: expand/collapse with width transition
  if (view === "desktop") {
    return (
      <div
        id="chat-panel-desktop"
        className={`chat-room sticky top-10 bg-white rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${
          showMessages ? "w-[400px] opacity-100" : "w-0 opacity-0"
        }`}
        style={{
          height: "90vh",
          maxHeight: "1000px",
        }}
      >
        <div className="h-full flex flex-col">
          <h2 className="text-2xl font-bold p-3 border-b border-gray-300 flex justify-between items-center">
            Chats <CloseIcon onClick={() => setShowMessages(false)} />
          </h2>
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto mb-3 space-y-2"
            >
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message, index) => {
                  return message.time &&
                    !isNaN(new Date(message.time).getTime()) ? (
                    <div key={index} className="rounded-sm bg-gray-100 p-1 ">
                      <p className="flex justify-between gap-4 items-center">
                        <span className="font-medium text-[#1976d2]">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(message.time).toLocaleTimeString()}
                        </span>
                      </p>
                      <p className="text-black font-normal whitespace-pre-line mt-1 break-words">
                        {message.data}
                      </p>
                    </div>
                  ) : null;
                })
              ) : (
                <p className="text-gray-400 text-center mt-4">
                  No messages yet
                </p>
              )}
            </div>
            <div className="flex gap-2 items-end border-t border-gray-300 pt-3">
              <TextField
                id="standard-basic"
                label="Enter message"
                variant="standard"
                multiline
                maxRows={6}
                sx={{ flex: 1 }}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Tooltip title="Click or press enter to send. Press shift + enter for next line">
                <Button
                  variant="contained"
                  sx={{ minWidth: "40px", height: "40px" }}
                  onClick={handleSendMessage}
                >
                  <SendIcon />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile mode: float over screen with slide-up animation
  return (
    <div
      id="chat-panel-mobile"
      className={`fixed bottom-12  right-0 max-w-[80vw] bg-white rounded-t-xl shadow-2xl transition-transform duration-300 ease-in-out z-50 ${
        showMessages ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        height: "70vh",
        maxHeight: "600px",
      }}
    >
      <div className="h-full flex flex-col">
        <h2 className="text-2xl font-bold p-3 border-b border-gray-300 flex justify-between items-center">
          Chats <CloseIcon onClick={() => setShowMessages(false)} />
        </h2>
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto mb-3 space-y-2"
          >
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((message, index) => {
                return message.time &&
                  !isNaN(new Date(message.time).getTime()) ? (
                  <div key={index} className="rounded-sm bg-gray-100 p-1 ">
                    <p className="flex justify-between gap-4 items-center">
                      <span className="font-medium text-[#1976d2]">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(message.time).toLocaleTimeString()}
                      </span>
                    </p>
                    <p className="text-black font-normal whitespace-pre-line mt-1 break-words">
                      {message.data}
                    </p>
                  </div>
                ) : null;
              })
            ) : (
              <p className="text-gray-400 text-center mt-4">No messages yet</p>
            )}
          </div>
          <div className="flex gap-2 items-end border-t border-gray-300 pt-3 pb-2">
            <TextField
              id="standard-basic"
              label="Enter message"
              variant="standard"
              multiline
              maxRows={4}
              sx={{ flex: 1 }}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Tooltip title="Click or press enter to send. Press shift + enter for next line">
              <Button
                variant="contained"
                sx={{ minWidth: "40px", height: "40px" }}
                onClick={handleSendMessage}
              >
                <SendIcon />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
