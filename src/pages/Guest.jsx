import { useState, useRef, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import { TextField, Button, IconButton } from "@mui/material";
import Navbar from "../components/Navbar";

function Guest() {
  let localVideoRef = useRef();
  const [username, setUsername] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const { setSnackbarOpen, setSnackbarMsg, isGuest, setUser } =
    useContext(AuthContext);

  const routeTo = useNavigate();
  function connect() {
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
    setUser({
      username: `${username} (guest)`,
      name: `${username} (guest)`,
    });
    routeTo(`/${meetingCode}`);
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
            >
              Go
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Guest;
