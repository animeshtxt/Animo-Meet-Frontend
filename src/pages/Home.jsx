import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { Button, TextField } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { AuthContext } from "../contexts/AuthContext";
import status from "http-status";

function Home() {
  let routeTo = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { setSnackbarMsg, setSnackbarOpen, setIsHost, client } =
    useContext(AuthContext);
  const [creatingNewMeet, setCreatingNewMeet] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [joinigMeet, setJoiningMeet] = useState(false);
  let handleJoinVideoCall = async () => {
    if (meetingCode === "") {
      setSnackbarMsg({
        severity: "warning",
        message: "Enter a valid meeting code",
      });
      setSnackbarOpen(true);
      return;
    }
    setCheckingCode(true);
    try {
      const response = await client.get(`/meeting/check-meet/${meetingCode}`);
      if (response.status === status.FOUND) {
        setJoiningMeet(true);
        routeTo(`/${meetingCode}`);
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
      }
    }
    setCheckingCode(false);
    setJoiningMeet(false);
  };
  function generateMeetingCode() {
    const segment = (length) =>
      Array.from({ length }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join("");

    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  }

  const createNewMeeting = async () => {
    setCreatingNewMeet(true);
    let isUnique = false;
    let newCode;
    while (!isUnique) {
      newCode = generateMeetingCode();
      console.log("checking code : ", newCode);
      const res = await client.get(`/meeting/check-code/${newCode}`);
      if (res.status === status.OK) {
        isUnique = true;
        setSnackbarMsg({
          severity: "success",
          message: "new meeting created successfully",
        });
        setCreatingNewMeet(false);
      } else {
        setSnackbarMsg({
          severity: "warning",
          message: res.data.message,
        });
      }
    }

    setIsHost(true);
    routeTo(`/${newCode}`);
  };
  return (
    <div className="h-screen w-full p-4 bg-[url('/images/call-bg.jpg')] bg-cover overflow-y-auto">
      <Navbar />
      <main className="h-full flex flex-wrap justify-evenly items-center gap-[50px] ">
        <div className="p-2 border border-black/20 rounded-xl flex gap-8 flex-wrap items-center max-[1230px]:flex-col">
          <section>
            <img
              src="/images/video-conference.jpg"
              alt=""
              className="max-[1230px]:w-[100%] max-w-[600px] rounded-xl"
            />
          </section>
          <section className="flex flex-col justify-center flex-wrap items-center">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-white">
                Video calls and meetings for everyone{" "}
              </h1>
              <h3 className="text-xl font-regular mb-3 text-white">
                Connect from anywhere with Animo Meet
              </h3>
            </div>
            <div className="flex gap-2 items-center flex-wrap flex-col mt-8">
              <Button
                sx={{
                  color: "white",
                  backgroundColor: "#2c7eea",
                  fontWeight: "bold",
                  display: "flex",
                  gap: "10px",
                }}
                onClick={createNewMeeting}
                variant="contained"
                disabled={creatingNewMeet}
              >
                <VideoCallIcon />

                {creatingNewMeet ? "Creating..." : "Create New Meeting"}
              </Button>

              <span className="font-bold text-white">OR</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter meeting code"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="border h-[36px] py-[2px] px-2 focus:outline-[#2c7eea] text-white"
                />
                <Button
                  sx={{
                    height: "40px",
                    color: "white",
                    backgroundColor: "#2c7eea",
                    fontWeight: "bold",
                    padding: "0 16px", // optional tweak
                    minWidth: "auto",
                  }}
                  onClick={handleJoinVideoCall}
                  variant="contained"
                  disabled={checkingCode || joinigMeet}
                >
                  {checkingCode
                    ? "Checking code"
                    : joinigMeet
                    ? "Joining"
                    : "Join"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
const AuthHome = withAuth(Home);
export default AuthHome;
