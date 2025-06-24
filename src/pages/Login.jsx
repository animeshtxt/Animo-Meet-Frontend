import { useContext, useState } from "react";
import { Link, useAsyncError, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import status from "http-status";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const router = useNavigate();
  const { handleLogin, setSnackbarOpen, setSnackbarMsg } =
    useContext(AuthContext);

  const [errorMessge, setErrorMessage] = useState({});

  const severityStat = {
    [status.NOT_FOUND]: "error", // 404
    [status.OK]: "success", // 200
    [status.BAD_REQUEST]: "warning", // 400
    [status.INTERNAL_SERVER_ERROR]: "error", // 500
    [status.UNAUTHORIZED]: "error", // 401
  };

  const loginUser = async (e) => {
    e.preventDefault();
    if (username == "") {
      setErrorMessage({
        target: "username",
        message: "This field is required",
      });
      return;
    } else if (password == "") {
      setErrorMessage({
        target: "password",
        message: "This field is required",
      });
    }
    try {
      const { serverMsg, serverStatus } = await handleLogin(username, password);
      console.log("Message : " + serverMsg + serverStatus);
      setSnackbarMsg({
        severity: severityStat[serverStatus] || 500,
        message: serverMsg,
      });
      setSnackbarOpen(true);
      if (serverStatus === status.OK) {
        router("/home");
      }
    } catch (e) {
      console.log(e);
      setSnackbarMsg(e.message);
      setSnackbarOpen(true);
    }
  };
  return (
    <div className="login-container">
      <div className="form-container">
        <h1 class="text-3xl font-bold text-center w-full">Leo Conference</h1>

        <h2 className="text-xl font-bold text-center w-full">Sign In</h2>
        <form action="">
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errorMessge.target && errorMessge.target == "username" ? (
              <p style={{ color: "red" }}>{errorMessge.message}</p>
            ) : null}
          </div>
          <div className="input-container">
            <label
              htmlFor="password"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Password{" "}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <input
                  type="checkbox"
                  id="cp-toggle"
                  style={{
                    width: "15px",
                    display: "inline-block",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                  }}
                  onClick={() => {
                    const showPw = document.getElementById("cp-toggle");
                    // const confPw = document.getElementById("confirm-password");
                    if (showPw.checked) {
                      setShowPw(true);
                    } else {
                      setShowPw(false);
                    }
                  }}
                />
                <label htmlFor="cp-toggle" style={{ display: "inline" }}>
                  Show
                </label>
              </div>
            </label>
            <input
              type={showPw ? "text" : "password"}
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessge.target && errorMessge.target == "password" ? (
              <p style={{ color: "red" }}>{errorMessge.message}</p>
            ) : null}
          </div>
          <button className="auth-btn" onClick={loginUser}>
            Signin
          </button>
        </form>
        <p style={{ width: "100%", textAlign: "center", margin: "10px" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "blue", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
