import { useState, useEffect } from "react";

function useWindowWidth() {
  // Initialize state with current window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Handler function to update the state
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call the handler once initially to set the initial value
    handleResize();

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs only on mount and unmount

  return windowWidth;
}

export default useWindowWidth;
