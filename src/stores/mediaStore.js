import { create } from "zustand";
import { logger } from "../utils/logger";

const useMediaStore = create((set, get) => ({
  // ── Media Availability & Toggle ──
  videoAvailable: false,
  setVideoAvailable: (value) => set({ videoAvailable: value }),

  audioAvailable: false,
  setAudioAvailable: (value) => set({ audioAvailable: value }),

  videoEnabled: false,
  setVideoEnabled: (value) => set({ videoEnabled: value }),

  audioEnabled: false,
  setAudioEnabled: (value) => set({ audioEnabled: value }),

  speakerOn: true,
  setSpeakerOn: (value) => set({ speakerOn: value }),

  shareScreen: false,
  setShareScreen: (value) => set({ shareScreen: value }),

  screenAvailable: false,
  setScreenAvailable: (value) => set({ screenAvailable: value }),

  handleScreen: () => set({ screen: !get().screen }),

  // ── Chat Messages ──
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  message: "",
  setMessage: (value) => set({ message: value }),

  newMessageCount: 0,
  setNewMessageCount: (value) => set({ newMessageCount: value }),

  // ── Participants ──
  videos: [],
  addVideo: (video) => set((state) => ({ videos: [...state.videos, video] })),
  removeVideo: (video) =>
    set((state) => ({ videos: state.videos.filter((v) => v !== video) })),
  setVideos: (value) =>
    set((state) => ({
      videos: typeof value === "function" ? value(state.videos) : value,
    })),
  clearVideos: () => set({ videos: [] }),

  connections: {},
  setConnections: (value) => set({ connections: value }),

  usernames: {},
  setUsernames: (value) =>
    set((state) => ({
      usernames: typeof value === "function" ? value(state.usernames) : value,
    })),

  // ── UI State ──
  showMessages: false,
  setShowMessages: (value) => set({ showMessages: value }),

  showInfo: false,
  setShowInfo: (value) => set({ showInfo: value }),

  anchorEl: null,
  setAnchorEl: (value) => set({ anchorEl: value }),

  isFirstRender: true,
  setIsFirstRender: (value) => set({ isFirstRender: value }),

  openDrawer: false,
  setOpenDrawer: (value) => set({ openDrawer: value }),

  value: "0",
  setValue: (value) => set({ value: value }),

  checkedOne: true,
  setCheckedOne: (value) => set({ checkedOne: value }),

  checkedTwo: true,
  setCheckedTwo: (value) => set({ checkedTwo: value }),

  checkedThree: true,
  setCheckedThree: (value) => set({ checkedThree: value }),

  copied: false,
  setCopied: (value) => set({ copied: value }),

  // ── Refs ──
  localVideoRef: { current: null },
  setLocalVideoRef: (value) => set({ localVideoRef: value }),

  socketRef: { current: null },
  setSocketRef: (value) => set({ socketRef: value }),

  socketIdRef: { current: null },
  setSocketIdRef: (value) => set({ socketIdRef: value }),

  videoRef: [],
  setVideoRef: (value) => set({ videoRef: value }),

  // ── Admit ──
  askForAdmit: true,
  setAskForAdmit: (value) => set({ askForAdmit: value }),

  admitRequest: 0,
  setAdmitRequest: (value) => set({ admitRequest: value }),

  // ── Media Tracks ──
  originalVideoTrack: null,
  setOriginalVideoTrack: (value) => set({ originalVideoTrack: value }),

  originalAudioTrack: null,
  setOriginalAudioTrack: (value) => set({ originalAudioTrack: value }),
}));

export default useMediaStore;
