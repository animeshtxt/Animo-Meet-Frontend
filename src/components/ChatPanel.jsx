import { useContext, useEffect, useRef, useState } from "react";
import { TextField, Button, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { MediaContext } from "../contexts/MediaContext";
import { AuthContext } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

export default function ChatPanel({ view }) {
  const scrollRef = useRef();
  const [message, setMessage] = useState("");
  const {
    showMessages,
    setShowMessages,
    socketRef,
    socketIdRef,
    messages,
    setNewMessages,
  } = useContext(MediaContext);
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
    socketRef.current.emit("chat-message", {
      sender: user.name,
      data: message,
      time: Date.now(),
      socketIdSender: socketIdRef.current,
    });
    setMessage("");
    logger.dev(
      `Message sent: \nMessagee: ${message} \n Time: ${Date.now()} \n SocketIdSender: ${socketIdRef.current}`,
    );
  };

  // Desktop mode: expand/collapse with width transition
  if (view === "desktop") {
    return (
      <div
        id="chat-panel-desktop"
        className={`chat-room sticky top-[3px] bg-white rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${
          showMessages ? "w-[350px] opacity-100" : "w-0 opacity-0"
        }`}
        style={{
          height: "calc(100vh - 70px)",
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
                    <div
                      key={index}
                      className={`rounded-sm p-1 ${message.socketIdSender === socketIdRef.current ? "bg-blue-100 ml-4" : "bg-gray-100 mr-4"}`}
                    >
                      <p className="flex justify-between gap-4 items-center">
                        <span className="font-medium text-xs text-[#1976d2]">
                          {message.sender}{" "}
                          {message.socketIdSender === socketIdRef.current
                            ? "(You)"
                            : ""}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(message.time).toLocaleTimeString()}
                        </span>
                      </p>
                      <p className="text-black font-normal text-sm whitespace-pre-line mt-1 break-words">
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
      className={`fixed bottom-12  right-0 max-w-[80vw] min-w-[300px] max-w-[300px] bg-white rounded-t-xl shadow-2xl transition-transform duration-300 ease-in-out z-50 ${
        showMessages ? "translate-y-0" : "translate-y-[100vh]"
      }`}
      style={{
        height: "100%",
        maxHeight: "450px",
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
