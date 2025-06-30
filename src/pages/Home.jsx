import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { Button, TextField } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
  let routeTo = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { setSnackbarMsg, setSnackbarOpen } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (meetingCode === "") {
      setSnackbarMsg({
        severity: "warning",
        message: "Enter a valid meeting code",
      });
      setSnackbarOpen(true);
      return;
    }
    routeTo(`/${meetingCode}`);
  };
  function generateMeetingCode() {
    const segment = (length) =>
      Array.from({ length }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join("");

    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  }

  const createNewMeeting = () => {
    const newCode = generateMeetingCode();
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
              >
                <VideoCallIcon />
                Create New Meeting
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
                >
                  Join
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
