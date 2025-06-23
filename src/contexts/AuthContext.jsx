import { createContext, useContext } from "react";
import axios from "axios";
import status from "http-status";
import { useState, React } from "react";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const AuthContext = createContext("");

const client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users",
  headers: { Authorization: "Bearer your_token" },
});

export function AuthProvider({ children }) {
  const authContext = useContext(AuthContext);
  const router = useNavigate();

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snakcbarMsg, setSnackbarMsg] = useState({});

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };
  const handleRegister = async (name, username, password) => {
    try {
      let response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response.status === status.CREATED) {
        return {
          serverMsg: response.data.message,
          serverStatus: response.status,
        };
      }
    } catch (e) {
      console.dir(e.response);
      const serverMsg = e.response?.data?.message || "Unknown error";
      const serverStatus = e.response?.status || 500;
      return {
        serverMsg,
        serverStatus,
      };
    }
  };
  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password,
      });
      if (response.status === status.OK) {
        console.dir(response);
        console.log("token : " + response.data.token);
        localStorage.setItem("token", response.data.token);
        // router("/home");
        return { serverMsg: response.data.message, serverStatus: status.OK };
      } else {
        console.log("login failed : " + response);
        return {
          serverMsg: "login failed",
          serverStatus: status.INTERNAL_SERVER_ERROR,
        };
      }
    } catch (e) {
      const serverMsg = e.response?.data?.message || "Unknown error";
      const serverStatus = e.response?.status || 500;
      console.log("Login failed : ", serverMsg, serverStatus);
      console.dir(e.response);
      return { serverMsg, serverStatus };
    }
  };
  return (
    <div>
      <AuthContext.Provider
        value={{
          handleLogin,
          handleRegister,
          snackbarOpen,
          setSnackbarOpen,
          snakcbarMsg,
          setSnackbarMsg,
        }}
      >
        {children}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          key={"top" + "right"}
        >
          <Alert
            severity={snakcbarMsg.severity}
            variant="filled"
            sx={{ width: "100%" }}
            onClose={handleClose}
          >
            {snakcbarMsg.message}
          </Alert>
        </Snackbar>
      </AuthContext.Provider>
    </div>
  );
}
