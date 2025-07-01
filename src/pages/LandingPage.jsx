import "../App.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
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
            Cover a distance by Animo Meet
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
