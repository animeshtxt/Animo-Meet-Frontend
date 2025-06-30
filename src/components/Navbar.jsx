import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Button, Popover, Typography } from "@mui/material";

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isSignUp, setIsSignup] = useState(false);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const url = useLocation();

  const {
    token,
    setToken,
    setSnackbarMsg,
    setSnackbarOpen,
    user,
    setUser,
    validateToken,
    isGuest,
    setIsGuest,
  } = useContext(AuthContext);
  const routeTo = useNavigate();
  useEffect(() => {
    validateToken();
    setIsGuest(url.pathname === "/guest");
    setIsLogin(url.pathname === "/login");
    setIsSignup(url.pathname === "/register");
  }, []);
  return (
    <nav className="navbar flex justify-between  items-center sticky top-2">
      <div id="brand-name">
        <Link to={"/"}>
          <h1 className="text-3xl font-bold text-center text-white max-[600px]:text-xl">
            Animo Meet
          </h1>
        </Link>
      </div>
      {token ? (
        <>
          <Button
            aria-describedby={id}
            variant="contained"
            onClick={handlePopoverOpen}
            sx={{
              height: "30px",
              width: "30px",
              borderRadius: "50%",
              padding: "20px",
              minWidth: 0, // Prevents MUI from enforcing a minimum width
              fontSize: "25px", // Adjust if text overflows
              lineHeight: 1,
              backgroundColor: "green",
              color: "white",
            }}
            // className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12  p-0 text-white bg-green-600 text-lg sm:text-xl md:text-2xl leading-none"
          >
            {user.name[0].toUpperCase()}
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <div className="p-2">
              <p className="mb-2">{user.name}</p>
              <p className="mb-2 text-green-500">{user.username}</p>
              <Button
                onClick={async () => {
                  localStorage.removeItem("token");
                  setToken("");
                  setUser({});

                  await setSnackbarMsg({
                    severity: "success",
                    message: "Logged out successfully",
                  });
                  setSnackbarOpen(true);
                  routeTo("/");
                }}
                sx={{
                  color: "white",
                  backgroundColor: "red",
                  fontWeight: "bold",
                }}
              >
                Logout
              </Button>
            </div>
          </Popover>
        </>
      ) : (
        <div className="nav-links flex gap-4">
          {!isGuest || isLogin || isSignUp ? (
            <Button
              sx={{ backgroundColor: "#e67c0e" }}
              className="h-6 w-4 sm:h-auto sm:w-auto"
            >
              <Link
                to="/guest"
                style={{ color: "white", textDecoration: "none" }}
                className="text-xs sm:text-lg"
              >
                Join as Guest
              </Link>
            </Button>
          ) : null}
          {!isLogin ? (
            <Button sx={{ backgroundColor: "green" }}>
              <Link
                to="/login"
                style={{ color: "white", textDecoration: "none" }}
                className="text-xs sm:text-lg"
              >
                Login
              </Link>
            </Button>
          ) : null}
          {!isSignUp ? (
            <Button sx={{ backgroundColor: "blue" }}>
              <Link
                to="/register"
                style={{ color: "white", textDecoration: "none" }}
                className="text-xs sm:text-lg"
              >
                {" "}
                Register
              </Link>
            </Button>
          ) : null}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
