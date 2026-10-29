# Afterhours

A working, live 3D portfolio sample for Pranjal Singh. The office is real shaded geometry rendered with Three.js, not a background image or video.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Open http://localhost:4173/. The dev server also prints a network address you can open from a phone on the same Wi-Fi.

## Explore

- Drag/swipe to orbit within the fixed viewing range (about 9–54° horizontally). Scroll/pinch to zoom within the room-safe distance limits. Panning and unrestricted orbit are disabled.
- Use the camera arrow buttons or keyboard arrow keys to look around. **Home** or **Reset room view** restores the default view. Your custom view is restored when leaving the computer.
- A seated character wears a relaxed blue shirt, loose dark trousers, and sneakers. Articulated fingers type with natural pauses, accompanied by small breathing and head movements. This is a stylized interpretation of the supplied description, not an exact facial likeness.
- Click the physical monitor or **Enter computer** to move into the retro desktop.
- Open **About me**, **My projects**, **Résumé**, **Guest notes**, and **Say hello**.
- Drag window title bars on desktop; minimize, restore, maximize, and close windows.
- Use the Start menu and taskbar to switch applications.
- Guest notes save to this browser's local storage. Nothing is sent to a server.
- Click the desk lamp to toggle it. Settings also control the lamp, motion, and shadow quality.
- Sound is opt-in, generated locally with the Web Audio API.
- Use Tab to navigate buttons. Escape closes a desktop window, then returns to the room.

## Make it your own

Edit `src/content.ts` to update your profile, experience, skills, project descriptions, links, and career story. The professional information and six projects were brought over from your earlier portfolio; Orbit and Field Notes remain clearly labeled concept studies. The résumé window can download a plain-text résumé generated from the same content. Update the information as your work and metrics change.

`src/Room.tsx` contains the room, props, lights, and material definitions. `src/RoomCamera.tsx` contains camera limits, input handling, reset, and computer transitions. `src/Character.tsx` contains the custom seated character, clothing, and typing animation. `src/Desktop.tsx` contains the desktop applications and window manager. `src/styles.css` controls the interface and responsive layouts.

## Quality and performance

- Self-hosted fonts and wallpaper; no runtime asset CDN dependency.
- 3D code loads separately from the initial interface.
- Rendering pauses on the desktop to avoid continuously animating a covered room.
- Reduced motion respects the OS preference and can be changed in settings.
- Touch devices start with lighter postprocessing; a quality toggle is also available.
- A scene error boundary offers direct access to the desktop if WebGL fails.
- Mobile uses a horizontal application launcher and windows constrained to the screen.

## Check and build

```sh
npm run typecheck
npm run build
npm run test:sites
npm run preview -- --host 0.0.0.0 --port 4174
```

Static files are produced in `dist/client`. The build also prepares a Worker in `dist/server`. The production portfolio is available at https://pranjal-afterhours.vercel.app/.

See `DEPLOYMENT.md` for the static-host settings, release archive, and domain considerations.

The site has been checked in a Chromium-based browser at desktop and mobile viewport sizes. Different browsers and graphics devices may behave differently.

## Assets

- All room geometry, surface textures, and synthesized ambient audio are authored in this project. No third-party room model is required.
- The original meadow wallpaper was generated for this project with OpenAI ImageGen; the optimized JPEG is served in `public/assets`, with the source preserved in `artwork`.
- The PS logo in the résumé comes from your earlier portfolio at `pranjalsingh.in`.
- Icons: Phosphor Icons (MIT).
- Fonts: Instrument Serif, DM Sans, IBM Plex Mono via Fontsource; their license files are included with the installed font packages.
- Your supplied screenshots guided the mood and interaction. Their artwork is not embedded in the sample.
