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

- `npm start` - Start development server with hot reload
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

### Pages (`src/pages/`)
- **Home.tsx**: Main recording interface with audio controls
- **History.tsx**: Recording file management and browsing
- **Transcript.tsx**: Live speech-to-text functionality

### Components (`src/components/`)
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

## Design Decisions and Trade-offs

### Architecture Choices

1. **Electron Framework**
   - **Decision**: Use Electron for cross-platform desktop development
   - **Trade-off**: Larger bundle size vs. native development complexity
   - **Rationale**: Faster development, web technologies, cross-platform support

2. **Web Speech API vs. External Services**
   - **Decision**: Use browser's Web Speech API for transcription
   - **Trade-off**: Limited accuracy and language support vs. privacy and offline capability
   - **Rationale**: No API keys required, works offline, better privacy

3. **Real-time Streaming Architecture**
   - **Decision**: Stream audio chunks to disk during recording
   - **Trade-off**: More complex implementation vs. better memory management
   - **Rationale**: Prevents memory issues with long recordings, enables real-time processing

4. **FFmpeg Integration**
   - **Decision**: Use FFmpeg for MP3 conversion
   - **Trade-off**: Additional dependency vs. native WebM-only support
   - **Rationale**: Broader format support, industry standard

### UI/UX Decisions

1. **Tab-based Navigation**
   - **Decision**: Simple tab interface for different features
   - **Trade-off**: Limited scalability vs. simplicity
   - **Rationale**: Clear feature separation, easy to understand

2. **Real-time Audio Level Monitoring**
   - **Decision**: Visual audio level feedback during recording
   - **Trade-off**: Additional complexity vs. better user experience
   - **Rationale**: Helps users understand microphone activity

3. **Dark Theme**
   - **Decision**: Dark theme as default
   - **Trade-off**: May not suit all users vs. modern aesthetic
   - **Rationale**: Better for extended use, modern design trend

### Technical Trade-offs

1. **TypeScript Usage**
   - **Decision**: Full TypeScript implementation
   - **Trade-off**: Additional compilation step vs. type safety
   - **Rationale**: Better maintainability, fewer runtime errors

2. **Tailwind CSS**
   - **Decision**: Utility-first CSS framework
   - **Trade-off**: Learning curve vs. rapid development
   - **Rationale**: Consistent design system, faster styling

3. **Memory Router**
   - **Decision**: Use MemoryRouter instead of BrowserRouter
   - **Trade-off**: No browser history vs. Electron compatibility
   - **Rationale**: Better suited for desktop applications

## Known Limitations and Future Improvements

### Current Limitations

1. **Speech Recognition Accuracy**
   - Web Speech API accuracy varies by browser and environment
   - Limited language support compared to cloud services
   - No custom vocabulary or training capabilities

2. **Audio Format Support**
   - Limited to WebM and MP3 formats
   - MP3 conversion requires FFmpeg installation
   - No lossless audio format support

3. **Platform Dependencies**
   - FFmpeg must be installed separately for MP3 support
   - Web Speech API availability varies by browser/OS

4. **Recording Storage**
   - All recordings saved to Desktop folder
   - No cloud storage integration
   - No automatic backup functionality

5. **Transcription Features**
   - No speaker identification
   - No punctuation or formatting options
   - No export to different text formats

### Future Improvements

1. **Enhanced Speech Recognition**
   - Integration with cloud speech services (Google, Azure, AWS)
   - Offline speech recognition models
   - Custom vocabulary support
   - Multi-language support

2. **Advanced Audio Features**
   - Noise reduction and audio enhancement
   - Multiple audio input sources
   - Audio editing capabilities
   - Lossless format support (FLAC, WAV)

3. **Improved User Experience**
   - Customizable recording storage locations
   - Cloud storage integration (Dropbox, Google Drive)
   - Keyboard shortcuts
   - System tray integration

4. **Transcription Enhancements**
   - Speaker identification and labeling
   - Automatic punctuation and formatting
   - Export to various formats (PDF, Word, etc.)
   - Search within transcriptions

5. **Performance Optimizations**
   - Background processing for long recordings
   - Compression options
   - Batch processing capabilities
   - Memory usage optimization

6. **Additional Features**
   - Recording scheduling
   - Audio quality presets
   - Plugin system for extensions
   - API for third-party integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
