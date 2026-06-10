<!-- @layer docs @kind doc -->
# Logs Widget

A real-time log viewer for app, game, and input events — handy for troubleshooting or seeing what the
app is doing internally.

## Features

- **Channels** — entries are colour-coded by source (app, game, input, …).
- **Timestamps** on every entry.
- **Auto-scroll** to the latest, with a rolling cap (~1000 entries).

Entries arrive from the Electron main process via the log bridge (`onLogEntry`), so both renderer and
main-process logs show up in one place. There's also a full-screen log overlay for longer sessions.
