import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  Button,
  Popover,
  Typography,
  AppBar,
  Box,
  Toolbar,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import MenuIcon from "@mui/icons-material/Menu";
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
  const [anchorEl2, setAnchorEl2] = useState(null);
  const menuOpen = Boolean(anchorEl2);
  const handleMenuClick = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl2(null);
  };
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

  const navButtons = (
    <>
      {!isGuest || isLogin || isSignUp ? (
        <Button
          sx={{
            backgroundColor: "#e67c0e",
            // width: { xs: "20px", sm: "50px" },
          }}
          className=""
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
    </>
  );

  return (
    <nav className="navbar flex justify-between  items-center sticky top-2">
      <div id="brand-name">
        <Link to={"/"}>
          <h1 className="text-3xl font-bold text-center text-white max-[600px]:text-xl flex items-center gap-2">
            <img
              src="/animo-meet-logo.png"
              alt="logo"
              className="h-8 w-auto "
            />
            <span className="leading-none">Animo Meet</span>
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
              backgroundColor: "#e65842",
              color: "white",
            }}
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
              horizontal: "right", // align to right edge of anchor
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right", // align right edge of Popover to anchor
            }}
          >
            <div className="p-2">
              <p className="mb-2">Name : {user.name}</p>
              <p className="mb-2 ">Username : {user.username}</p>
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
        <>
          <div className="nav-links flex gap-4 max-[600px]:hidden">
            {navButtons}
          </div>
          <div className="min-[600px]:hidden">
            <Button
              id="basic-button"
              aria-controls={menuOpen ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              onClick={handleMenuClick}
              style={{ display: window.innerWidth >= 600 ? "none" : "block" }}
            >
              <MenuIcon sx={{ color: "white" }} />
            </Button>
          </div>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl2}
            open={menuOpen}
            onClose={handleMenuClose}
            slotProps={{
              list: {
                "aria-labelledby": "basic-button",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right", // align to right edge of anchor
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right", // align right edge of Popover to anchor
            }}
          >
            <MenuItem className="flex flex-col gap-2 items-start justify-start">
              {navButtons}
            </MenuItem>
          </Menu>
        </>
      )}
    </nav>
  );
}

export default Navbar;
