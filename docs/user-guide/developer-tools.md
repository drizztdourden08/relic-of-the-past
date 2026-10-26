<!-- @layer docs @kind doc -->
# Developer Tools

Debugging and diagnostic tools available from the menu, under **Advanced**.

---

## Dev Console

Opens Chromium DevTools, the same developer tools you get in Chrome and Edge. Useful for:

- Inspecting the React component tree
- Viewing console logs and errors
- Debugging CSS layout issues
- Monitoring network requests
- Profiling performance

Open it from the menu under **Advanced**, with **Dev Console**.

---

## Sprite Debug

A visual inspector for the game's sprite system:

- Shows every currently loaded sprite
- Displays sprite metadata such as position, animation frame, and tile index
- Helps you confirm asset extraction is correct
- Helps debug rendering issues

---

## Controllers

The controller tools live under **Advanced > Controllers**, also covered in [Controller Calibration](controller-calibration.md):

- **Diagnostics:** a guided wizard that captures the raw bytes a controller reports
- **Pad page:** live inputs, calibration and rumble tests for each connected controller
- **Logs:** the connect and disconnect history

---

## Logs Widget

The real-time log viewer lives in the menu under **Widgets**, as **Logs**, but it earns its place among the dev tools:

- Shows internal app events
- Filters by log level
- Captures game engine state changes
- Displays error stack traces
