import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const { setSnackbarMsg, setSnackbarOpen, user, validateToken } =
      useContext(AuthContext);
    const routeTo = useNavigate();
    // const isAuthenticated = () => {
    //   if (validateToken()) {
    //     console.log("User present : ", user.username);
    //     return true;
    //   }
    //   console.log("User not present");
    //   return false;
    // };

    useEffect(() => {
      const checkAuth = async () => {
        const isValid = await validateToken();
        if (!isValid) {
          setSnackbarMsg({
            severity: "warning",
            message: "You must be logged in",
          });
          setSnackbarOpen(true);
          routeTo("/login");
        }
      };
      checkAuth();
    }, []);
    return <WrappedComponent {...props} />;
  };
  return AuthComponent;
};
export default withAuth;
