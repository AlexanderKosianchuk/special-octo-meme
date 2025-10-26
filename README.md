# SpecialOctoMeme

A modern desktop audio recording application built with Electron, React, and TypeScript. SpecialOctoMeme provides real-time audio recording with live transcription capabilities, offering both traditional audio recording and speech-to-text functionality.

## Features

- **Real-time Audio Recording**: Record audio with live streaming to disk
- **Live Speech Transcription**: Real-time speech-to-text using Web Speech API
- **Multiple Audio Formats**: Support for WebM and MP3 formats (with FFmpeg conversion)
- **Audio Level Monitoring**: Visual feedback with real-time audio level meters
- **Recording History**: Browse and manage your recorded files
- **Cross-platform**: Available for macOS, Windows, and Linux
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Acknowledgments

This project is based on the [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate), a foundation for scalable cross-platform apps. We extend our gratitude to the maintainers and contributors of this excellent boilerplate project.

## Setup Instructions

### Prerequisites

- **Node.js**: Version 22
- **npm**: Version 7.x or higher
- **FFmpeg** (optional): For MP3 conversion support
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Linux: `sudo apt install ffmpeg` (Ubuntu/Debian)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SpecialOctoMeme
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

```bash
npm start
```

#### Production Build

```bash
npm run package
```

The packaged application will be available in the `release/build` directory.

### Development Commands

- `npm dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run package` - Package the application for distribution
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## Architecture Overview

SpecialOctoMeme follows a multi-process Electron architecture with clear separation of concerns:

### Main Process (`src/main/`)

- **main.ts**: Application entry point, window management, and lifecycle
- **audio-recording-ipc.ts**: IPC handlers for audio recording operations
- **menu.ts**: Application menu configuration
- **preload.ts**: Secure bridge between main and renderer processes
- **util.ts**: Utility functions for path resolution

### Renderer Process (`src/renderer/`)

- **App.tsx**: Main React application with routing
- **index.tsx**: Renderer entry point
- **App.css**: Global styles

### Components (`src/components/`)

- **Home.tsx**: Main recording interface with audio controls
- **History.tsx**: Recording file management and browsing
- **Transcript.tsx**: Live speech-to-text functionality
- **Layout.tsx**: Application layout wrapper
- **Navigation.tsx**: Tab-based navigation
- **ControlButtons.tsx**: Recording control interface
- **AudioFormatSelector.tsx**: Audio format selection
- **RecordingDuration.tsx**: Timer display
- **StatusIndicator.tsx**: Recording status feedback
- **HelpText.tsx**: Contextual help information

### Key Technologies

- **Electron**: Desktop application framework
- **React 19**: UI framework with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Web Speech API**: Browser-based speech recognition
- **MediaRecorder API**: Audio recording
- **FFmpeg**: Audio format conversion
- **React Router**: Client-side routing
