import { createContext, useContext } from "react";
import axios from "axios";
import status from "http-status";
import { useState, React } from "react";
// import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useEffect } from "react";

export const AuthContext = createContext("");

const client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users",
  headers: { Authorization: "Bearer your_token" },
});

export function AuthProvider({ children }) {
  // const authContext = useContext(AuthContext);
  // const router = useNavigate();

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState({});
  const [token, setToken] = useState();
  const [user, setUser] = useState({});
  const [isGuest, setIsGuest] = useState(true);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };
  const validateToken = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "") {
      setIsGuest(true);
      console.log("Token not present");
      return false;
    }
    try {
      let response = await client.get("/validate-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === status.OK) {
        setToken(token);
        setUser({ username: response.data.username, name: response.data.name });
        console.log("Token verified, user : ", response.data.name);
        setIsGuest(false);
        return true;
      } else {
        console.log(
          `status : ${response.status} message: ${response.data.message}`
        );
      }
    } catch (e) {
      console.dir(e.response);
      const serverMsg = e.response?.data?.message || "Unknown error";
      const serverStatus = e.response?.status || 500;
      // setSnackbarMsg({
      //   severity: "error",
      //   message: serverMsg,
      // });
      // setSnackbarOpen(true);
      setIsGuest(true);
      return false;
    }

    return false;
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
        setToken(response.data.token);
        setUser({ username: response.data.username, name: response.data.name });
        console.log("Token : ", token);
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

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token && token !== "") {
  //     if (validateToken(token)) {
  //       setToken(token);
  //     }
  //   } else {
  //     console.log("No token present");
  //   }
  // }, []);
  return (
    <div>
      <AuthContext.Provider
        value={{
          handleLogin,
          handleRegister,
          snackbarOpen,
          setSnackbarOpen,
          snackbarMsg,
          setSnackbarMsg,
          token,
          setToken,
          user,
          setUser,
          validateToken,
          isGuest,
          setIsGuest,
        }}
      >
        {children}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          key={"top" + "right"}
        >
          <Alert
            severity={snackbarMsg.severity}
            variant="filled"
            sx={{ width: "100%" }}
            onClose={handleClose}
          >
            {snackbarMsg.message}
          </Alert>
        </Snackbar>
      </AuthContext.Provider>
    </div>
  );
}
