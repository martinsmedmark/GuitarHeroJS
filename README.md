# Guitar Hero JS

A 3D Guitar Hero game built with Three.js and WebAudioXML.

## Features

- 3D guitar hero gameplay
- WebAudioXML integration for audio management
- Hot-reloading development with Vite
- Sound effects and background music
- Beat detection and note spawning

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Vite development server with hot-reloading:

```bash
npm run dev
```

3. The browser will automatically open to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Build for Production

```bash
npm run build
```

## Project Structure

- `engine/` - Game engine modules
- `public/` - Static assets (audio, images)
- `css/` - Stylesheets
- `audio.xml` - WebAudioXML configuration
- `music.xml` - iMusic configuration

## Controls

- Use keyboard keys to hit notes
- Pause/Resume with spacebar
- Volume control with slider

## Technologies Used

- Three.js for 3D graphics
- WebAudioXML for audio management
- Vite for development and building
- Vanilla JavaScript (ES6 modules)
