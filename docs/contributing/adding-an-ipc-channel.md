<!-- @layer docs @kind doc -->
# Adding an IPC Channel

The renderer reaches the main process **only** through IPC. Every channel is typed
end-to-end against a single contract in `shared/ipc/`, so the compiler — not
convention — keeps the three sites (handler, preload, renderer) in sync. See
[Electron & IPC](../architecture/electron-ipc.md) for the architecture.

> **Golden rule:** never call `ipcMain` / `ipcRenderer` / `webContents.send`
> directly. Use the typed wrappers in `electron/lib/ipc/`. Those two files are the
> only place raw Electron IPC is allowed.

## Pick the direction

| Direction | Contract | Main | Preload |
|-----------|----------|------|---------|
| Request → response | `InvokeContract` | `handle` | `invoke` |
| Renderer → main, fire-and-forget | `SendContract` | `on` | `send` |
| Main → renderer event | `EventContract` | `emit` | `subscribe` |

Channels are named **`domain:action`** (e.g. `profiles:list`, `saves:normal:create`).

## Steps (invoke example: `foo:get`)

### 1. Declare the channel — `shared/ipc/invoke-contract.ts`

This is the **single source of truth** for the signature:

```ts
'foo:get': (id: string) => Promise<FooResult>;
```

### 2. Map a friendly name — `shared/ipc/maps.ts`

Add one line to `INVOKE_MAP` (the only place the method↔channel link is written).
`satisfies` rejects a typo'd channel; `IpcApi` (the `window.api` type) and the
preload method are **derived** automatically — you do **not** edit `env.d.ts`.

```ts
getFoo: 'foo:get',
```

### 3. Implement the handler — `electron/<domain>/ipc-handlers.ts`

Use the typed `handle`; args and return type are inferred from the contract, so a
mismatch won't compile:

```ts
import { handle } from '../lib/ipc/handle';

const registerFooHandlers = (): void => {
  handle('foo:get', (_event, id) => getFoo(id)); // id: string, must return Promise<FooResult>
};

export { registerFooHandlers };
```

Register it in `main.ts` by adding to the `IPC_HANDLERS` list (`{ register: registerFooHandlers }`,
or `{ register, devOnly: true }` for dev-only tools).

### 4. Preload — usually nothing to do

Flat methods are generated from the maps by `buildInvoke`/`buildSend`/`buildEvents`
in `preload.ts`. Only **nested namespaces** (`updater`, `shadowCasting`,
`screenEditor`) are wired by hand — add there with the typed `invoke`/`subscribe`
if your channel belongs to one.

Call it from the renderer as `window.api.getFoo(id)` — fully typed.

## Events (`emit` / `subscribe`)

Add to `EventContract` (the value is the **listener** signature), then to
`EVENT_MAP` as `onFooChange: 'foo:change'`. Emit from main with
`emit(win, 'foo:change', payload)`; the renderer gets `window.api.onFooChange(cb)`
returning an unsubscribe function (generated).

## Checklist

- [ ] Channel named `domain:action`; correct direction (invoke/send/event).
- [ ] Signature added to the matching contract in `shared/ipc/`.
- [ ] Method↔channel line added to the join map (flat methods) **or** wired in a
      nested namespace (preload) — `env.d.ts` is **not** edited.
- [ ] Handler uses the typed `handle`/`on`/`emit`; registered in `main.ts`.
- [ ] No raw `ipcMain`/`ipcRenderer`/`webContents.send` outside `electron/lib/ipc/`.
- [ ] `npm run lint` green (the contract makes any drift a type error).
- [ ] No native module imported into the renderer; no security flags weakened.
