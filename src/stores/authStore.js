import { create } from "zustand";

import status from "http-status";
import { client } from "../utils/client";
import { logger } from "../utils/logger";

const useAuthStore = create((set, get) => ({
  // State
  token: null,
  user: { name: "", username: "", type: "guest" },
  setUser: ({ name, username, type }) =>
    set({ user: { name, username, type } }),
  isGuest: true,
  loading: true,
  snackbars: [],

  addSnackbar: ({ severity, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      snackbars: [...state.snackbars, { id, severity, message, duration }],
    }));
  },
  removeSnackbar: (id) => {
    set((state) => ({
      snackbars: state.snackbars.filter((s) => s.id !== id),
    }));
  },
  // Actions
  handleLogin: async (username, password) => {
    try {
      const response = await client.post("/users/login", {
        username,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        set({
          token: response.data.token,
          user: {
            username: response.data.username,
            name: response.data.name,
            type: "registered",
          },
          isGuest: false,
        });
        get().addSnackbar({
          severity: "success",
          message: "Logged in successfully",
        });
        return true;
      } else {
        get().addSnackbar({
          severity: "error",
          message: "Login failed, try again",
        });
        return false;
      }
    } catch (e) {
      console.dir(e.response);
      if (e.response.status === 404) {
        get().addSnackbar({
          severity: "error",
          message: "User not found, check username",
        });
      } else if (e.response.status === 401) {
        get().addSnackbar({
          severity: "error",
          message: "Invalid password",
        });
      } else {
        get().addSnackbar({
          severity: "error",
          message: "Internal server error. Please try again later.",
        });
      }
      return false;
    }
  },

  handleRegister: async (name, username, password) => {
    try {
      let response = await client.post("/users/signup", {
        name,
        username,
        password,
      });

      if (response.status === status.CREATED) {
        set({
          user: {
            username: response.data.username,
            name: response.data.name,
            type: "registered",
          },
          isGuest: false,
          loading: false,
        });
        get().addSnackbar({
          severity: "success",
          message: response.data.message,
        });
        return {
          serverMsg: response.data.message,
          serverStatus: response.status,
        };
      }
    } catch (e) {
      if (e.response.status === 409) {
        get().addSnackbar({
          severity: "warning",
          message: e.response.data.message,
        });
      } else {
        get().addSnackbar({
          severity: "error",
          message: "Internal server error. Please try again later.",
        });
      }
      console.dir(e.response);
      const serverMsg = e.response?.data?.message || "Unknown error";
      const serverStatus = e.response?.status || 500;
      return {
        serverMsg,
        serverStatus,
      };
    }
  },

  handleLogout: async () => {
    localStorage.removeItem("token");
    set({
      token: null,
      user: { type: "guest" },
      isGuest: true,
      loading: false,
    });
    get().addSnackbar({
      severity: "success",
      message: "Logged out successfully",
    });
  },
  validateToken: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({
        isGuest: true,
        user: { type: "guest", name: "", username: "" },
        loading: false,
      });
      console.log("Token not present");
      return false;
    }
    try {
      let response = await client.get("/users/verify-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === status.OK) {
        set({
          token,
          user: {
            username: response.data.username,
            name: response.data.name,
            type: "registered",
          },
          isGuest: false,
          loading: false,
        });
        console.log("Token verified, user from authStore: ", response.data);

        return true;
      } else {
        console.error(
          `status : ${response.status} message: ${response.data.message}`,
        );
        return false;
      }
    } catch (err) {
      console.log(err);
      set({ isGuest: true, user: { type: "guest" }, loading: false });

      return false;
    }
  },
}));

export default useAuthStore;
