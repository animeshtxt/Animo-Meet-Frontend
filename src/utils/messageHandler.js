import { logger } from "./logger";
function handleReceiveMessage(socketIdRef, setMessages, setNewMessages) {
  // Return a function that accepts the message object from backend
  return function addMessage(messageObj) {
    const { sender, data, time, socketIdSender } = messageObj;

    logger.dev("📨 Chat message received:", {
      sender,
      data,
      time,
      socketIdSender,
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: sender,
        data: data,
        time: time,
        socketIdSender: socketIdSender,
      },
    ]);

    if (
      socketIdSender !== socketIdRef.current &&
      time &&
      !isNaN(new Date(time).getTime())
    ) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };
}

export { handleReceiveMessage };
