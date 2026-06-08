<!-- @layer claude-config @kind doc -->
---

name: electron
description: Work on this project's Electron layer — main process, preload, IPC between renderer and main, custom protocols, window management, native modules (HID/USB), and the electron-vite build. Use when adding/changing an IPC channel, a main-process handler, preload API surface, window behavior, file/userData access, or anything in apps/desktop/electron/. Also when a renderer feature needs Node/OS access it can't do itself
---

# Electron layer

This app is **Electron + electron-vite**. Three build targets (see
`electron.vite.config.ts`): `main` (+ `hid-worker`), `preload`, `renderer`.
Follow @docs/coding-standards.md for all code here too.

## Process model & security (do not weaken)

`apps/desktop/electron/window/create-window.ts` sets:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false`.

**Never** enable `nodeIntegration` or disable `contextIsolation` to "make something
work." The renderer reaches Node/OS **only** through the preload bridge. If the
renderer needs a new native/OS capability, add an IPC channel — don't open the sandbox.

## The IPC contract — adding a channel touches 3 places

Naming convention for channels: **`domain:action`** (e.g. `profiles:list`,
`window:minimize`, `roms:import`). `invoke`/`handle` for request→response;
`send`/`on` for fire-and-forget or main→renderer events.

### 1. Main-process handler — `apps/desktop/electron/<domain>/ipc-handlers.ts`

Each domain owns a file exporting a `register<Domain>Handlers()` function:

```ts
import { ipcMain } from 'electron';

function registerFooHandlers(): void {
  ipcMain.handle('foo:get', async (_event, id: string) => {
    // ... main-process work (fs, native modules, etc.)
    return result;
  });
}

export { registerFooHandlers };
```

Then call `registerFooHandlers()` in `apps/desktop/electron/main.ts` alongside the
other `register*Handlers()` calls.

### 2. Preload bridge — `apps/desktop/electron/preload.ts`

Expose a typed method on `window.api` (the single `contextBridge.exposeInMainWorld('api', {...})` object):

```ts
getFoo: (id: string) => ipcRenderer.invoke('foo:get', id),
// event subscription pattern (return an unsubscribe fn):
onFooChange: (cb: (v: T) => void) => {
  const handler = (_e: Electron.IpcRendererEvent, v: T) => cb(v);
  ipcRenderer.on('foo:change', handler);
  return () => ipcRenderer.removeListener('foo:change', handler);
},
```

### 3. Renderer types — `apps/desktop/src/env.d.ts`

Add the method signature to the `window.api` type so the renderer is typed. Keep
it in sync with what preload actually exposes.

## Patterns already in use (match them)

- **Per-domain folders:** `input/`, `msu/`, `profiles/`, `roms/`, `saves/`,
  `protocol/`, `sessions/`, `sprites/`, `window/`, `dialogs/`, etc. New surface →
  new domain folder with its own `ipc-handlers.ts`, not a dumping ground.
- **userData paths:** use `getUserDataPath(...)` from `electron/lib/paths.ts`;
  never hardcode `%AppData%`. `app.setName('relic-of-the-past')` fixes the root.
- **Custom protocol:** images from userData are served via the privileged
  `app-sprite://` scheme (`protocol/sprite-protocol.ts`, registered in `main.ts`),
  exposed to renderer as `getSpritesBaseUrl()`. Use a protocol (not `file://`) for
  serving userData assets to the renderer.
- **Native modules** (`node-hid`, `usb`): main-process / worker only
  (`hid-worker.ts` is a separate build entry). Never import them in the renderer.
- **electron-toolkit `is.dev`** for dev-only branches.

## Build & run

- `npm run dev` — electron-vite dev (HMR renderer + main reload).
- `npm run build` — production build to `dist/`.
- Adding a new main-process **entry** (like another worker) → add it to the `main`
  lib entries in `electron.vite.config.ts`.
- `externalizeDepsPlugin()` keeps native deps external — don't try to bundle them.

## Checklist for any Electron change

- [ ] Channel named `domain:action`; `invoke/handle` vs `send/on` chosen correctly.
- [ ] Handler in the right `<domain>/ipc-handlers.ts`, registered in `main.ts`.
- [ ] Preload exposes a typed method; **no** new global beyond `window.api`.
- [ ] `env.d.ts` updated to match.
- [ ] Event subscriptions return an unsubscribe function and are cleaned up.
- [ ] No native module imported into the renderer; no security flags weakened.
- [ ] Files obey @docs/coding-standards.md (size, one-thing-per-file, exports at end).
