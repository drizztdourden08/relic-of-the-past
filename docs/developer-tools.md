# Developer Tools

Debugging and diagnostic tools available from Menu → Advanced.

---

## Dev Console

Opens Chromium DevTools (the same developer tools available in Chrome/Edge). Useful for:

- Inspecting the React component tree
- Viewing console logs and errors
- Debugging CSS layout issues
- Monitoring network requests
- Profiling performance

Shortcut: accessible from Menu → Advanced → **Dev Console**.

---

## Sprite Debug

A visual inspector for the game's sprite system:

- Shows all currently loaded sprites
- Displays sprite metadata (position, animation frame, tile index)
- Useful for verifying asset extraction correctness
- Helps debug rendering issues

---

## Input Calibration

A controller diagnostic panel (also documented in [Input & Controllers](features/input-controllers.md)):

- **Byte inspector** — raw gamepad input values in real-time
- **Vibration tester** — sends rumble pulses to verify haptics
- **Input recording** — captures sequences for replay/debugging

---

## Logs Widget

While technically a widget (Menu → Widgets → Logs), the real-time log viewer is useful for development:

- Shows all internal app events
- Filters by log level
- Captures game engine state changes
- Displays error stack traces
