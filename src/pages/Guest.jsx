import { useState, useRef, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import status from "http-status";

import { TextField, Button, IconButton } from "@mui/material";
import Navbar from "../components/Navbar";

function Guest() {
  let localVideoRef = useRef();
  const [guestName, setGuestName] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const { setSnackbarOpen, setSnackbarMsg, isGuest, setUser, client } =
    useContext(AuthContext);
  const [checkingCode, setCheckingCode] = useState(false);
  const [joinigMeet, setJoiningMeet] = useState(false);

  const routeTo = useNavigate();
  async function connect() {
    if (guestName === "") {
      setSnackbarMsg({
        severity: "warning",
        message: "Enter name",
      });
      setSnackbarOpen(true);
      return;
    }
    if (meetingCode === "") {
      setSnackbarMsg({
        severity: "warning",
        message: "Enter valid meeting code",
      });
      setSnackbarOpen(true);
      return;
    }
    setCheckingCode(true);
    try {
      const response = await client.get(`/meeting/check-meet/${meetingCode}`);
      if (response.status === status.OK) {
        setJoiningMeet(true);
        setUser({
          username: `${guestName}`,
          name: `${guestName}`,
        });
        return routeTo(`/${meetingCode}`);
      } else {
        setSnackbarMsg({
          severity: "warning",
          message: response.data.message,
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSnackbarMsg({
          severity: "error",
          message: "Meeting not found. Please check the code and try again.",
        });
        setSnackbarOpen(true);
        console.error(error.response);
      } else {
        setSnackbarMsg({
          severity: "error",
          message: "Something went wrong. Try again later.",
        });
        setSnackbarOpen(true);
        console.log(error.response);
      }
    }
    setJoiningMeet(false);
    setCheckingCode(false);
  }

  return (
    <div className="p-4 w-full h-screen bg-[url('/images/call-bg.jpg')] bg-cover overflow-y-auto">
      <Navbar />
      <main className=" flex justify-center items-center flex-col h-full">
        <div className="bg-white p-4 h-[400px] flex flex-col justify-start gap-8 items-center ">
          <h1 className="text-3xl font-bold text-center w-full text-black">
            Join as Guest
          </h1>

          <div className="h-full w-[300px] mt-4 flex flex-col justify-start gap-8 items-center">
            <TextField
              id="outlined-basic"
              label="Enter name"
              variant="outlined"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
              }}
              sx={{
                input: { color: "black" }, // input text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "black" }, // default border
                  "&:hover fieldset": { borderColor: "#90caf9" }, // on hover
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" }, // on focus
                },
                "& .MuiInputLabel-root": { color: "black" }, // label color
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #ffffff inset", // grey background
                  WebkitTextFillColor: "black",
                  caretColor: "#808285",
                },
              }}
              InputLabelProps={{
                style: { color: "black" }, // label color (alternative)
              }}
              InputProps={{
                style: { color: "black" }, // input text color (alternative)
              }}
            />

            <TextField
              id="outlined-basic"
              label="Enter meeting code"
              variant="outlined"
              value={meetingCode}
              onChange={(e) => {
                setMeetingCode(e.target.value);
              }}
              sx={{
                input: { color: "black" }, // input text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "black" }, // default border
                  "&:hover fieldset": { borderColor: "#90caf9" }, // on hover
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" }, // on focus
                },
                "& .MuiInputLabel-root": { color: "black" }, // label color
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #ffffff inset", // grey background
                  WebkitTextFillColor: "black",
                  caretColor: "#fcfcfc",
                },
              }}
              InputLabelProps={{
                style: { color: "black" }, // label color (alternative)
              }}
              InputProps={{
                style: { color: "black" }, // input text color (alternative)
              }}
            />

            <Button
              variant="contained"
              onClick={connect}
              sx={{
                height: "50px",
                boxSizing: "border-box",
                marginX: "10px",
                "&.Mui-disabled": {
                  backgroundColor: "#1565c0b5", // your custom disabled background
                  color: "#e9f1f9b5", // your custom disabled text color
                },
              }}
              disabled={checkingCode || joinigMeet}
            >
              {checkingCode
                ? "Checking code..."
                : joinigMeet
                ? "Going to lobby..."
                : "Check"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Guest;
