import { logger } from "./logger";
import useMediaStore from "../stores/mediaStore";
function handleReceiveMessage(socketIdRef, addMessage, setNewMessageCount) {
  // Return a function that accepts the message object from backend
  return function addMessageHandler(messageObj) {
    const { sender, data, time, socketIdSender } = messageObj;

    logger.dev("📨 Chat message received:", {
      sender,
      data,
      time,
      socketIdSender,
    });

    addMessage({
      sender: sender,
      data: data,
      time: time,
      socketIdSender: socketIdSender,
    });

    if (
      socketIdSender !== socketIdRef.current &&
      time &&
      !isNaN(new Date(time).getTime())
    ) {
      const current = useMediaStore.getState().newMessageCount;
      setNewMessageCount(current + 1);
    }
  };
}

export { handleReceiveMessage };
