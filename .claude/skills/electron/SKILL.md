<!-- @layer claude-config @kind doc -->
---

name: electron
description: Work on this project's Electron layer — main process, preload, IPC between renderer and main, custom protocols, window management, native modules (HID/USB), and the electron-vite build. Use when adding/changing an IPC channel, a main-process handler, preload API surface, window behavior, file/userData access, or anything in apps/desktop/electron/. Also when a renderer feature needs Node/OS access it can't do itself
---

# Electron layer

This app is **Electron + electron-vite**. Three build targets (see
`electron.vite.config.ts`): `main` (+ `hid-worker`), `preload`, `renderer`.
Follow @docs/contributing/coding-standards.md for all code here too.

## Process model & security (do not weaken)

`apps/desktop/electron/window/create-window.ts` sets:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false`.

**Never** enable `nodeIntegration` or disable `contextIsolation` to "make something
work." The renderer reaches Node/OS **only** through the preload bridge. If the
renderer needs a new native/OS capability, add an IPC channel — don't open the sandbox.

## The IPC contract — typed end-to-end from one source

Every channel's signature lives **once** in a channel-keyed contract under
`shared/ipc/`; the preload, the handlers, and the renderer's `window.api` are all
type-checked against it. **Never** call `ipcMain`/`ipcRenderer`/`webContents.send`
directly — use the typed wrappers in `electron/lib/ipc/` (the only files allowed to).
Full procedure + checklist: @docs/contributing/adding-an-ipc-channel.md.

Channels are named **`domain:action`**. Direction picks the contract + wrappers:
`InvokeContract`→`handle`/`invoke` (request→response), `SendContract`→`on`/`send`
(fire-and-forget), `EventContract`→`emit`/`subscribe` (main→renderer events).

### 1. Declare the channel — `shared/ipc/*-contract.ts` (single source of truth)

```ts
// invoke-contract.ts
'foo:get': (id: string) => Promise<FooResult>;
```

### 2. Map a friendly name — `shared/ipc/maps.ts`

```ts
getFoo: 'foo:get',   // satisfies-checked; window.api type + preload method DERIVE from this
```

`env.d.ts` is **not** edited — `IpcApi` is derived from the contracts + maps.

### 3. Implement the handler — `apps/desktop/electron/<domain>/ipc-handlers.ts`

```ts
import { handle } from '../lib/ipc/handle';

const registerFooHandlers = (): void => {
  handle('foo:get', (_event, id) => getFoo(id)); // args + return inferred from the contract
};

export { registerFooHandlers };
```

Register it in `main.ts` by adding to the `IPC_HANDLERS` list (`devOnly: true` for dev tools).

### 4. Preload — usually nothing

Flat methods are generated from the maps (`buildInvoke`/`buildSend`/`buildEvents`).
Only nested namespaces (`updater`, `shadowCasting`, `screenEditor`) are wired by
hand with the typed `invoke`/`subscribe`. Call it as `window.api.getFoo(id)`.

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

- [ ] Channel named `domain:action`; correct direction (invoke/send/event) → correct contract.
- [ ] Signature in the `shared/ipc/` contract; method↔channel line in the join map
      (flat) or wired in a nested namespace. **`env.d.ts` is not hand-edited.**
- [ ] Handler uses the typed `handle`/`on`/`emit`; registered in `main.ts`'s `IPC_HANDLERS`.
- [ ] No raw `ipcMain`/`ipcRenderer`/`webContents.send` outside `electron/lib/ipc/`.
- [ ] No new global beyond `window.api`; no native module in the renderer; no security flags weakened.
- [ ] Files obey @docs/contributing/coding-standards.md (size, one-thing-per-file, exports at end).
