import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useAuthStore from "../stores/authStore";
import status from "http-status";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const routeTo = useNavigate();
  const { token, user, handleLogin, validateToken, addSnackbar } =
    useAuthStore();

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

    if (!username || username.trim() === "") {
      setErrorMessage({
        target: "username",
        message: "Username is required",
      });
      return;
    }
    if (!password || password.trim() === "") {
      setErrorMessage({
        target: "password",
        message: "Password is required",
      });
      return;
    }
    setLoggingIn(true);
    if (username == "") {
      setErrorMessage({
        target: "username",
        message: "This field is required",
      });
      return;
    } else if (password === "") {
      setErrorMessage({
        target: "password",
        message: "This field is required",
      });
    }
    try {
      const loginSuccess = await handleLogin(username, password);
      if (loginSuccess) {
        routeTo("/home");
      } else {
        setLoggingIn(false);
      }
    } catch (e) {
      setLoggingIn(false);
      console.log(e);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        routeTo("/home");
        addSnackbar({
          severity: "info",
          message: "You are already logged in",
        });
      }
    };
    checkAuth();
  }, []);
  return (
    <div className="bg-[url('/images/call-bg.avif')] bg-cover p-1 w-full h-screen overflow-y-auto flex flex-col">
      <Navbar />
      <main className="flex-grow login-container flex flex-col justify-center items-center ">
        <div className="form-container">
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
            <button
              variant="contained"
              className="auth-btn"
              onClick={loginUser}
              disabled={loggingIn}
            >
              {loggingIn ? "Signin in..." : "Signin"}
            </button>
          </form>
          <p style={{ width: "100%", textAlign: "center", margin: "10px" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "blue", textDecoration: "none" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
