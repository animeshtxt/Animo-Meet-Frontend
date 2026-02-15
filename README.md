# Animo Meet - Frontend

A modern, real-time video conferencing application built with React and WebRTC technology. Animo Meet provides seamless video calling experiences with integrated chat functionality, user authentication, and responsive design.

**Note**: You can visit the Backend repository [here](https://github.com/animeshtxt/Animo-Meet-Backend).

## 🚀 Features

### Core Functionality

- **Real-time Video Conferencing**: Peer-to-peer video calls using WebRTC technology
- **Audio/Video Controls**: Toggle camera and microphone on/off during calls
- **Screen Sharing**: Share your screen with other participants
- **Real-time Chat**: Integrated chat panel for messaging during meetings
- **Multi-participant Support**: Connect with multiple users simultaneously

### User Experience

- **Guest Access**: Join meetings without creating an account
- **User Authentication**: Secure login and signup system
- **Responsive Design**: Optimized for desktop and mobile devices
- **Meeting Lobby**: Preview and configure audio/video settings before joining
- **Dynamic Video Layouts**: Adaptive layout for multiple participants
- **Connection Status Indicators**: Visual feedback for audio/video availability

### Technical Features

- **Socket.IO Integration**: Real-time bidirectional communication
- **State Management**: Efficient state handling with Zustand
- **Error Boundaries**: Graceful error handling and recovery
- **Modern UI**: Material-UI components with Tailwind CSS styling
- **CI/CD Pipeline**: Automated deployment with GitHub Actions
- **Deployment**: Deployed on AWS EC2 with dynamic DNS, Nginx and Let's Encrypt SSL (https://animo-meet.animesh-kgpian.duckdns.org/). Also deployed on Render at https://animo-meet.onrender.com/

## 🛠️ Tech Stack

### Frontend Framework

- **React 19.1.0** - Modern UI library with latest features
- **Vite 6.3.5** - Next-generation frontend build tool for fast development

### UI & Styling

- **Material-UI (MUI) 7.1.2** - Comprehensive React component library
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **Emotion** - CSS-in-JS styling solution

### Real-time Communication

- **WebRTC** - Peer-to-peer video/audio streaming
- **Socket.IO Client 4.8.1** - Real-time event-based communication

### State & Routing

- **Zustand 5.0.11** - Lightweight state management
- **React Router DOM 7.6.2** - Client-side routing

### Additional Libraries

- **Axios 1.10.0** - HTTP client for API requests
- **MUI Icons Material** - Comprehensive icon library

### Development Tools

- **ESLint** - Code linting and quality assurance
- **Vite Plugin React** - Fast refresh and HMR support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/animeshtxt/Animo-Meet-Frontend.git
cd Animo-Meet-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_SOCKET_URL=http://localhost:8080/
ENVIRONMENT="development"
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build production-ready bundle            |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint for code quality checks       |

## 🎯 Usage

### Starting a Meeting

1. **Sign Up/Login**: Create an account or login to access full features
2. **Guest Access**: Alternatively, join as a guest with a meeting code
3. **Configure Settings**: Set up your camera and microphone in the lobby
4. **Join Meeting**: Enter the meeting room and start collaborating

### During a Meeting

- **Toggle Video**: Click the camera icon to turn video on/off
- **Toggle Audio**: Click the microphone icon to mute/unmute
- **Share Screen**: Use the screen share button to present your screen
- **Open Chat**: Click the chat icon to send messages to participants
- **Leave Meeting**: Click the leave button to exit the call

## 🏗️ Project Structure

```
Animo-Meet-Frontend/
├── public/              # Static assets
│   │   ├── images/
├── src/
│   ├── assets/         # Images, icons, and media files
│   ├── components/     # Reusable React components
│   │   ├── AppRoutes.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── Controls.jsx
│   │   ├── Lobby.jsx
│   │   ├── MeetingRoom.jsx
│   │   ├── Navbar.jsx
│   │   └── VideoTile.jsx
│   ├── contexts/       # React context providers
│   │   ├── AuthContext.jsx
│   │   ├── MediaContext.jsx
│   │   ├── SocketContext.jsx
│   ├── pages/          # Page components
│   │   ├── Guest.jsx
│   │   ├── Home.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── VideoMeetComponent.jsx
│   ├── utils/                 # Utility functions and helpers
│   │   ├── logger.js          # Custom logger file
│   │   ├── mediaHandler.js    # Media handling functions
│   │   ├── socketHandler.js   # Socket handling functions
│   │   ├── WindowWidth.jsx    # Helpe functions for responsiveness
│   └── main.jsx        # Application entry point
├── .env                # Environment variables
├── package.json        # Project dependencies
└── vite.config.js      # Vite configuration
```

## 🔐 Environment Variables

| Variable            | Description          | Example                        |
| ------------------- | -------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:8080/api/v1` |
| `VITE_SOCKET_URL`   | Socket.IO server URL | `http://localhost:8080`        |

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Developer

Built with ❤️ by a passionate developer

---

**Note**: This is the frontend application. Make sure the backend server is running for full functionality.
