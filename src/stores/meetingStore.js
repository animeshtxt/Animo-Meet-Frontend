import { create } from "zustand";
import { logger } from "../utils/logger";

import useAuthStore from "./authStore";
import { client } from "../utils/client";
import status from "http-status";
const useMeetingStore = create((set, get) => ({
  isHost: false,
  setIsHost: (value) => set({ isHost: value }),

  isCoHost: false,
  setIsCoHost: (value) => set({ isCoHost: value }),

  meetingCode: "",
  setMeetingCode: (value) => set({ meetingCode: value }),

  meetingCodeChecked: false,
  setMeetingCodeChecked: (value) => set({ meetingCodeChecked: value }),

  meetExists: false,
  setMeetExists: (value) => set({ meetExists: value }),

  askForAdmit: true,
  setAskForAdmit: (value) => set({ askForAdmit: value }),

  meetControls: {},
  setMeetControls: (value) => set({ meetControls: value }),

  leftMeet: false,
  setLeftMeet: (value) => set({ leftMeet: value }),
  // checkHost: async (meetcode) => {
  //   if (isGuest && askForGuestName) {
  //     logger.dev(guestName, "is a  guest");
  //     set({
  //       user: {
  //         name: `${guestName}`,
  //         username: `${guestName}`,
  //         type: "guest",
  //       },
  //     });
  //   } else {
  //     logger.dev(user.name, "not guest");
  //     try {
  //       const response = await client.get("/meeting/check-host", {
  //         params: { username: user.username, meetcode },
  //       });
  //       if (response.status === status.OK) {
  //         setIsHost(true);
  //       }
  //       logger.dev(response.data);
  //     } catch (error) {
  //       logger.error("Error checking host:", error);
  //     }
  //   }
  // },
  checkMeetingCode: async (meetcode) => {
    try {
      const { user, isGuest } = useAuthStore.getState();
      const response = await client.get(`/meeting/check-meet/${meetcode}`);
      if (response.status === status.OK && response.data.exists) {
        const meetDetails = response.data.meeting;
        logger.dev(`Meeting found ${meetDetails}`);
        if (!isGuest) {
          if (meetDetails.hostUsername === user.username) {
            set({ isHost: true });
            logger.dev(`${user.username} is Host`);
          } else if (meetDetails.coHostUsernames.includes(user.username)) {
            set({ isCoHost: true });
            logger.dev(`${user.username} is Co-Host`);
          }
        }
        set({ meetingCodeChecked: true, meetExists: true });
      } else {
        logger.dev("No such meeting found.");
        // useAuthStore
        //   .getState()
        //   .addSnackbar("warning", "No such meeting found", 5000);
        set({ meetingCodeChecked: true, meetExists: false });
      }
      logger.dev(response.data);
    } catch (error) {
      useAuthStore.getState().addSnackbar({
        severity: "error",
        message: "Some error occured checking code",
      });
      logger.error("Error checking meeting code:", error);
      set({ meetingCodeChecked: true, meetExists: false });
    }
  },
  // checkHost();
  // console.log("isHost in useEffect : ", isHost);
}));

export default useMeetingStore;
