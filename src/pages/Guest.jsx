import { useState, useRef, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import status from "http-status";

import { TextField, Button, IconButton } from "@mui/material";
import Navbar from "../components/Navbar";

function Guest() {
  let localVideoRef = useRef();
  const [username, setUsername] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const { setSnackbarOpen, setSnackbarMsg, isGuest, setUser, client } =
    useContext(AuthContext);
  const [checkingCode, setCheckingCode] = useState(false);
  const [joinigMeet, setJoiningMeet] = useState(false);

  const routeTo = useNavigate();
  async function connect() {
    if (username === "") {
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
          username: `${username} (guest)`,
          name: `${username} (guest)`,
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
        <div className="bg-black p-4 h-[400px] flex flex-col justify-start gap-8 items-center rounded-xl">
          <h1 className="text-3xl font-bold text-center w-full text-white">
            Join as Guest
          </h1>

          <div className="h-full w-[300px] mt-4 flex flex-col justify-start gap-8 items-center">
            <TextField
              id="outlined-basic"
              label="Enter name"
              variant="outlined"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              sx={{
                input: { color: "white" }, // input text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" }, // default border
                  "&:hover fieldset": { borderColor: "#90caf9" }, // on hover
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" }, // on focus
                },
                "& .MuiInputLabel-root": { color: "white" }, // label color
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #23272f inset",
                  WebkitTextFillColor: "white",
                  caretColor: "white",
                },
              }}
              InputLabelProps={{
                style: { color: "white" }, // label color (alternative)
              }}
              InputProps={{
                style: { color: "white" }, // input text color (alternative)
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
                input: { color: "white" }, // input text color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" }, // default border
                  "&:hover fieldset": { borderColor: "#90caf9" }, // on hover
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" }, // on focus
                },
                "& .MuiInputLabel-root": { color: "white" }, // label color
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #23272f inset",
                  WebkitTextFillColor: "white",
                  caretColor: "white",
                },
              }}
              InputLabelProps={{
                style: { color: "white" }, // label color (alternative)
              }}
              InputProps={{
                style: { color: "white" }, // input text color (alternative)
              }}
            />

            <Button
              variant="contained"
              onClick={connect}
              sx={{
                height: "50px",
                boxSizing: "border-box",
                marginX: "10px",
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
