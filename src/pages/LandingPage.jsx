import "../App.css";
import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div id="brand-name">
          <h1>Leo Conference</h1>
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
          <h1 style={{ color: "white" }}>
            <span style={{ color: "#47d817" }}>Connect </span>with your loved
            Ones
          </h1>
          <p style={{ color: "white" }}>Cover a distance by Leo Conference</p>
          <div id="get-started">
            <Link to="/home" style={{ textDecoration: "none", color: "white" }}>
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
