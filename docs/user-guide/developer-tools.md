<!-- @layer docs @kind doc -->
# Developer Tools

Debugging and diagnostic tools available from Menu → Advanced.

---

## Dev Console

Opens Chromium DevTools, the same developer tools you get in Chrome and Edge. Useful for:

- Inspecting the React component tree
- Viewing console logs and errors
- Debugging CSS layout issues
- Monitoring network requests
- Profiling performance

Shortcut: accessible from Menu → Advanced → **Dev Console**.

---

## Sprite Debug

A visual inspector for the game's sprite system:

- Shows every currently loaded sprite
- Displays sprite metadata such as position, animation frame, and tile index
- Helps you confirm asset extraction is correct
- Helps debug rendering issues

---

## Input Calibration

A controller diagnostic panel, also covered in [Input & Controllers](input-controllers.md):

- **Byte inspector** — raw gamepad input values in real time
- **Vibration tester** — sends rumble pulses to verify haptics
- **Input recording** — captures sequences for replay and debugging

---

## Logs Widget

The real-time log viewer lives under Menu → Widgets → Logs, but it earns its place among the dev tools:

- Shows internal app events
- Filters by log level
- Captures game engine state changes
- Displays error stack traces
