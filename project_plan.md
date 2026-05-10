# ALttP PC Port Randomizer + React/Electron Architecture Plan

## Project Goals

- Build a modern ALttP randomizer platform around the `snesrev/zelda3` PC port.
- Use:
  - TypeScript
  - React
  - Electron
  - WebAssembly (WASM)
  - HTML Canvas rendering
- Run the ALttP PC port as a WASM game core rendered inside a React application.
- Support:
  - Randomizer seeds
  - Tracker overlays
  - Future Archipelago integration
  - Future entrance randomizer support
  - Modern UI/UX systems

---

# High-Level Architecture

```txt
Electron App
├─ React UI Layer
│  ├─ Game Canvas
│  ├─ Tracker UI
│  ├─ Seed Management
│  ├─ Settings Panels
│  ├─ Spoiler Logs
│  └─ Overlay Systems
│
├─ WASM Zelda3 Core
│  ├─ Game Simulation
│  ├─ Rendering
│  ├─ Audio
│  ├─ Input
│  ├─ Save System
│  └─ Randomizer Hooks
│
└─ Local Filesystem
   ├─ assets.dat
   ├─ saves/
   ├─ seeds/
   └─ config/
```

---

# Technology Stack

## Frontend

- TypeScript
- React
- Vite
- Electron

## Game Core

- C
- SDL2
- Emscripten
- WebAssembly

## Data Formats

- JSON
- Binary save files

---

# Repository Structure

```txt
project-root/
├─ apps/
│  ├─ desktop/
│  │  ├─ electron/
│  │  └─ react-ui/
│
├─ core/
│  ├─ zelda3/
│  ├─ wasm-build/
│  └─ randomizer-hooks/
│
├─ shared/
│  ├─ types/
│  ├─ events/
│  └─ seed-schema/
│
├─ assets/
├─ saves/
├─ seeds/
└─ docs/
```

---

# Phase 1 — Compile Zelda3 to WebAssembly

## Objectives

- Compile the ALttP PC port using Emscripten.
- Render the game into an HTML canvas.
- Validate keyboard input and audio playback.

## Tasks

### Build Setup

- Install:
  - Emscripten SDK
  - SDL2
  - CMake/Make
- Configure WASM build pipeline.

### WASM Output

- Produce:
  - `.wasm`
  - `.js`
  - asset loader glue

### Canvas Rendering

- Render the game into:
  - `<canvas>`
- Validate:
  - Frame rendering
  - Aspect ratio
  - Scaling

### Input

- Keyboard input
- Controller/gamepad support

### Save System

- Validate browser filesystem persistence.
- Support:
  - save creation
  - save loading

## Deliverables

- Playable vanilla ALttP PC port inside a browser canvas.

---

# Phase 2 — Electron + React Integration

## Objectives

- Integrate the WASM game core into a React application.
- Use Electron as the desktop shell.

## Tasks

### Electron Setup

- Configure:
  - Electron
  - Vite
  - React
  - TypeScript

### Canvas Component

Create:

```tsx
<GameCanvas />
```

Responsibilities:
- Mount WASM canvas
- Handle resizing
- Handle focus/input ownership

### UI Shell

Implement:
- Main layout
- Side panels
- Bottom panels
- Overlay containers

### Window Management

Support:
- Fullscreen
- Window resizing
- Aspect ratio preservation

## Deliverables

- Electron desktop app running ALttP inside React.

---

# Phase 3 — Convert Zelda3 Runtime Into a Controlled Library API

## Objectives

- Remove direct ownership of lifecycle from the native game loop.
- Expose a clean API callable from TypeScript.

## Required C API

```c
zelda3_init(...)
zelda3_shutdown(...)

zelda3_load_assets(...)
zelda3_load_seed(...)

zelda3_set_input(...)
zelda3_frame(...)

zelda3_save_export(...)
zelda3_save_import(...)
```

## Tasks

### Lifecycle Refactor

- Replace monolithic main loop.
- Expose frame-by-frame execution.

### Memory Management

- Expose safe WASM memory APIs.

### Rendering Ownership

- Ensure rendering is externally controlled.

## Deliverables

- React controls the game lifecycle.
- WASM core behaves like a library.

---

# Phase 4 — Event Bridge Between Game Core and React

## Objectives

- Expose gameplay events to the frontend.

## Event Categories

### Gameplay

```txt
location_checked
item_received
dungeon_entered
room_changed
death
goal_completed
```

### Save Events

```txt
save_loaded
save_created
save_updated
```

### Randomizer Events

```txt
seed_loaded
spoiler_loaded
hint_received
```

## Tasks

### Event Dispatcher

Implement:
- C → JS event bridge

### TypeScript Event System

Implement:
- Typed event subscriptions

Example:

```ts
core.on("location_checked", payload => {
  tracker.markChecked(payload.locationId);
});
```

## Deliverables

- React UI reacts live to gameplay state.

---

# Phase 5 — Randomizer Data Layer

## Objectives

- Externalize randomized game data into seed files.

## Seed Format

```json
{
  "locations": {},
  "dungeonPrizes": {},
  "goalMode": {},
  "medallions": {},
  "entrances": {}
}
```

## Required APIs

```c
Randomizer_GetItemForLocation(...)
Randomizer_GetDungeonPrize(...)
Randomizer_GetEntranceDestination(...)
Randomizer_GetGoalMode(...)
```

## Tasks

### Item Overrides

Support:
- Chests
- NPC rewards
- Boss rewards
- Dungeon prizes

### Seed Loading

- Parse JSON seed data.
- Load runtime mappings.

### Runtime Overrides

- Replace vanilla lookup logic.

## Deliverables

- Game contents driven entirely from external seed data.

---

# Phase 6 — Tracker and Overlay Systems

## Objectives

- Build modern overlay systems using React.

## Systems

### Item Tracker

- Inventory tracker
- Progressive items
- Dungeon items

### Location Tracker

- Checked locations
- Remaining locations
- Region filtering

### Dungeon Tracker

- Crystals
- Pendants
- Big keys
- Small keys

### Overlay UI

- Transparent HUD layers
- Minimap overlays
- Hint notifications

### Utility Panels

- Spoiler logs
- Notes
- Seed metadata
- Timer/splits

## Deliverables

- Full modern randomizer UI experience.

---

# Phase 7 — Entrance Randomizer

## Objectives

- Externalize entrance routing.

## Tasks

### Entrance Mapping

Support:
- Overworld entrances
- Dungeon entrances
- Interior exits
- Cave exits
- Warp points

### Transition Metadata

Store:
- Destination room
- Spawn coordinates
- Camera state
- World state

### Runtime Injection

Override:
- Entrance lookup tables
- Exit routing

## Deliverables

- Fully functional entrance randomizer.

---

# Phase 8 — Archipelago / Multiplayer Integration

## Objectives

- Support remote item synchronization.

## Tasks

### Networking

Implement:
- WebSocket client
- Session management
- Reconnect logic

### Item Queue

Support:
- Incoming item queue
- Delayed item delivery
- Duplicate prevention

### Sync Events

Track:
- Checked locations
- Sent items
- Received items

### Overlay Systems

Add:
- Multiplayer feed
- Team tracker
- Connection state

## Deliverables

- Functional Archipelago-compatible client.

---

# Phase 9 — Tooling and Packaging

## Objectives

- Create a production-ready desktop application.

## Tasks

### Installer

Support:
- Windows
- Linux
- macOS

### Asset Extraction

- ROM extraction workflow
- Asset validation

### Save Management

- Profiles
- Import/export
- Cloud sync readiness

### Auto Updates

- Electron updater pipeline

## Deliverables

- Production desktop application.

---

# Internal Core Principles

## Game Core Responsibilities

- Simulation
- Rendering
- Audio
- Save state
- Randomizer lookups

## React Responsibilities

- UI
- Overlay systems
- Tracker systems
- Seed management
- Network UI
- Settings
- Window management

## Data Flow

```txt
React UI
    ↓
WASM bridge
    ↓
Zelda3 core
    ↓
Event bridge
    ↓
React UI
```

---

# Future Extensions

- Co-op modes
- Spectator mode
- Replay system
- Integrated auto-tracker
- Shader/post-processing system
- Custom cosmetic packs
- Web-based seed sharing
- Replay/timeline analysis
- Plugin/mod API