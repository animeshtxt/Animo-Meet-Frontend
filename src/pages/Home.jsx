import { useNavigate } from "react-router-dom";
import { Link } from "react-router";
import { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Button, TextField } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { AuthContext } from "../contexts/AuthContext";
import status from "http-status";
import { logger } from "../utils/logger";

function Home() {
  let routeTo = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const {
    setSnackbarMsg,
    setSnackbarOpen,
    setIsHost,
    client,
    user,
    setUser,
    token,
    isGuest,
  } = useContext(AuthContext);
  const [creatingNewMeet, setCreatingNewMeet] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [joinigMeet, setJoiningMeet] = useState(false);
  const [previousMeets, setPreviousMeets] = useState([]);

  let handleJoinVideoCall = async (m) => {
    if (m === "") {
      setSnackbarMsg({
        severity: "warning",
        message: "Enter a valid meeting code",
      });
      setSnackbarOpen(true);
      return;
    }
    setCheckingCode(true);
    try {
      const response = await client.get(`/meeting/check-meet/${m}`);
      if (response.status === status.OK) {
        setJoiningMeet(true);
        logger.dev("Meeting found redirecting to ", m);
        routeTo(`/${m}`);
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
    // setCheckingCode(false);
    setJoiningMeet(false);
  };
  function generateMeetingCode() {
    const segment = (length) =>
      Array.from({ length }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26)),
      ).join("");

    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  }

  const createNewMeeting = async () => {
    setCreatingNewMeet(true);
    let isUnique = false;
    let newCode;
    while (!isUnique) {
      newCode = generateMeetingCode();
      logger.dev("checking code : ", newCode);
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

  useEffect(() => {
    logger.dev("Rendering home.jsx");
    const getPrevMeets = async () => {
      try {
        const res = await client.get(`/meeting/prev-meets/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === status.OK) {
          logger.dev("found");
          logger.dev(res.data);
          setPreviousMeets(res.data);
        } else {
          logger.dev("not found");

          setSnackbarMsg({
            severity: "warning",
            message: res.data.message,
          });
        }
      } catch (e) {
        logger.error(e);
      }
    };

    if (user.type === "registered") {
      getPrevMeets();
    }
  }, []);

  return (
    <div className="h-screen w-full p-1 bg-[url('/images/call-bg.avif')]  bg-cover overflow-y-auto flex flex-col gap-[20px]">
      <Navbar />
      <main className="flex flex-grow flex-wrap justify-center items-center gap-[50px] ">
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
              {!isGuest && (
                <>
                  <Button
                    sx={{
                      color: "white",
                      backgroundColor: "#2c7eea",
                      fontWeight: "bold",
                      display: "flex",
                      gap: "10px",
                      "&.Mui-disabled": {
                        backgroundColor: "#1565c0b5",
                        color: "#e9f1f9b5",
                      },
                    }}
                    onClick={createNewMeeting}
                    variant="contained"
                    disabled={creatingNewMeet}
                  >
                    <VideoCallIcon />

                    {creatingNewMeet ? "Creating..." : "Create New Meeting"}
                  </Button>

                  <span className="font-bold text-white">OR</span>
                </>
              )}
              {isGuest && (
                <>
                  <span className="font-bold text-white">
                    You are joining as a Guest.{" "}
                    <Link to="/login" style={{ color: "#0be00b" }}>
                      Login
                    </Link>{" "}
                    or{" "}
                    <Link to="/register" style={{ color: "#0be00b" }}>
                      Signup
                    </Link>{" "}
                    to create meeting.
                  </span>
                  <span>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={user.name}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          name: e.target.value,
                          username: `${e.target.value}_guest`,
                        })
                      }
                      className="border h-[36px] py-[2px] px-2 focus:outline-[#2c7eea] text-white"
                    />
                  </span>
                </>
              )}
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
                    "&.Mui-disabled": {
                      backgroundColor: "#1565c0b5",
                      color: "#e9f1f9b5",
                    },
                  }}
                  onClick={() => {
                    handleJoinVideoCall(meetingCode);
                  }}
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
              <div style={{ textAlign: "center" }}>
                {previousMeets.length > 0 ? (
                  <div style={{ marginTop: "10px" }}>
                    <h1 style={{ color: "white" }}>Previous meets</h1>
                    {previousMeets.map((m, i) => {
                      return (
                        <p
                          key={i}
                          style={{
                            color: "white",
                            marginBottom: "20px",
                            marginTop: "20px",
                            textAlign: "center",
                          }}
                        >
                          {m}
                          <Button
                            sx={{
                              height: "30px",
                              color: "white",
                              backgroundColor: "#5a779d",
                              fontWeight: "bold",
                              padding: "0 16px", // optional tweak
                              marginLeft: "20px",
                              minWidth: "auto",
                              "&.Mui-disabled": {
                                backgroundColor: "#2664abb5",
                                color: "#e9f1f9b5",
                              },
                              ":hover": {
                                backgroundColor: "#2c7eea",
                                color: "rgba(255, 255, 255, 1)",
                              },
                            }}
                            onClick={() => {
                              handleJoinVideoCall(m);
                            }}
                            variant="contained"
                            disabled={checkingCode || joinigMeet}
                          >
                            {checkingCode
                              ? "Checking code"
                              : joinigMeet
                                ? "Joining"
                                : "Join"}
                          </Button>
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
// const AuthHome = withAuth(Home);
// export default AuthHome;
export default Home;
