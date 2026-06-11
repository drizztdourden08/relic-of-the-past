<!-- @layer docs @kind doc -->
# Logs Widget

A real-time log viewer for app, game, and input events. It's handy for troubleshooting or just seeing
what the app is doing internally.

## Features

- Entries are colour-coded by channel, so you can tell app, game, and input apart at a glance.
- Every entry carries a timestamp.
- The view auto-scrolls to the latest entry and keeps a rolling cap of about 1000 entries.

Entries arrive from the Electron main process through the log bridge (`onLogEntry`), so renderer and
main-process logs land in one place. There's also a full-screen log overlay for longer sessions.
