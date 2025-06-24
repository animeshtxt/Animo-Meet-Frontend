import "../App.css";
import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div id="brand-name">
          <h1 className="text-3xl font-bold text-center">Leo Conference</h1>
        </div>
        <div className="nav-links">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Join as Guest
          </Link>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Login
          </Link>
          <Link
            to="/register"
            style={{ color: "white", textDecoration: "none" }}
          >
            {" "}
            Register
          </Link>
        </div>
      </nav>
      <div id="connect">
        <div>
          <h1
            style={{ color: "white" }}
            className="text-3xl font-bold text-start "
          >
            <span
              style={{ color: "#47d817" }}
              className="text-3xl font-bold text-start "
            >
              Connect{" "}
            </span>
            with your loved Ones
          </h1>
          <p
            style={{ color: "white" }}
            className="text-xl font-medium text-start "
          >
            Cover a distance by Leo Conference
          </p>
          <div id="get-started">
            <Link
              to="/home"
              style={{
                textDecoration: "none",
                color: "white",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
        <div>
          <img
            id="mobile-image"
            style={{ width: "30vw" }}
            src="images/mobile.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
