function handleReceiveMessage(socketIdRef, setMessages, setNewMessages) {
  return function addMessage(sender, data, time, socketIdSender) {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, time: time },
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
