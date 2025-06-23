import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import status from "http-status";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { handleRegister, setSnackbarOpen, setSnackbarMsg } =
    useContext(AuthContext);
  // const [open, setOpen] = useState(false);
  // const [msg, setMsg] = useState({});
  const [inputError, setInputError] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const router = useNavigate();

  const severityStat = {
    [status.CONFLICT]: "error", // 409
    [status.CREATED]: "success", // 201
    [status.BAD_REQUEST]: "warning", // 400
    [status.INTERNAL_SERVER_ERROR]: "error", // 500
  };

  // const handleClose = (event, reason) => {
  //   if (reason === "clickaway") return;
  //   setSnackbarOpen(false);
  // };

  const checkInputError = () => {
    if (name === "" || !name) {
      setInputError({
        field: "name",
        message: "This field is required",
      });
      return false;
    } else if (username === "" || !username) {
      setInputError({
        field: "username",
        message: "This field is required",
      });
      return false;
    } else if (password === "" || !password || password.length < 8) {
      setInputError({
        field: "password",
        message: "Password must be 8 characters long",
      });
      return false;
    } else if (
      confirmPassword === "" ||
      !confirmPassword ||
      confirmPassword != password
    ) {
      setInputError({
        field: "confirmPassword",
        message: "Confirm password not matching with password",
      });

      return false;
    }
    setInputError({});
    return true;
  };
  const registerUser = async (e) => {
    e.preventDefault();
    setInputError({});
    if (!checkInputError()) {
      return;
    }
    const { serverMsg, serverStatus } = await handleRegister(
      name,
      username,
      password
    );
    setSnackbarMsg({
      severity: severityStat[serverStatus] || "failure",
      message: serverMsg || "Internal server error",
    });
    setSnackbarOpen(true);
    if (serverStatus === status.CREATED) {
      router("/login");
    }
  };
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setInputError({});
    if (!name || name === "") {
      setInputError({
        field: "name",
        message: "This field is required",
      });
    }
    // checkInputError();
  }, [name]);
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setInputError({});
    if (!username || username === "") {
      setInputError({
        field: "username",
        message: "This field is required",
      });
    }
    // checkInputError();
  }, [username]);
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setInputError({});
    if (password === "" || !password || password.length < 8) {
      setInputError({
        field: "password",
        message: "Password must be 8 characters long",
      });
    }
    // checkInputError();
  }, [password]);
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setInputError({});
    if (
      confirmPassword === "" ||
      !confirmPassword ||
      confirmPassword != password
    ) {
      setInputError({
        field: "confirmPassword",
        message: "Confirm password not matching with password",
      });
    }
    // checkInputError();
  }, [confirmPassword]);
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setInputError({});
    if (!username || username === "") {
      setInputError({
        field: "username",
        message: "This field is required",
      });
    }
    // checkInputError();
  }, [username]);

  return (
    <div className="login-container">
      <div className="form-container">
        <h1 style={{ textAlign: "center", width: "100%" }}>Leo Conference</h1>

        <h2 style={{ textAlign: "center", width: "100%" }}>Signup</h2>
        <form action="">
          <div className="input-container">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            {inputError && inputError.field === "name" ? (
              <p style={{ color: "red" }}>{inputError.message}</p>
            ) : null}
          </div>
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            {inputError && inputError.field === "username" ? (
              <p style={{ color: "red" }}>{inputError.message}</p>
            ) : null}
          </div>
          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              required
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
            />
            {inputError && inputError.field === "password" ? (
              <p style={{ color: "red" }}>{inputError.message}</p>
            ) : null}
          </div>
          <div className="input-container">
            <label
              htmlFor="confirm-password"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Confirm Password{" "}
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
              name="confirmPassword"
              id="confirm-password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />{" "}
            {inputError && inputError.field === "confirmPassword" ? (
              <p style={{ color: "red" }}>{inputError.message}</p>
            ) : null}
          </div>

          <button className="auth-btn" onClick={registerUser}>
            Signup
          </button>
        </form>
        <p style={{ width: "100%", textAlign: "center", margin: "10px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "blue", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
      {/* <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        key={"top" + "right"}
      >
        <Alert
          severity={msg.severity}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={handleClose}
        >
          {msg.message}
        </Alert>
      </Snackbar> */}
    </div>
  );
}
