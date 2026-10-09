<!-- @layer docs @kind doc -->
# Adding an IPC Channel

The renderer reaches the main process only through IPC. Every channel is typed
end-to-end against a single contract in `apps/desktop/src/ipc/`, so the compiler keeps the
three sites (handler, preload, renderer) in sync without relying on convention. See
[Electron & IPC](../architecture/electron-ipc.md) for the architecture.

> **Golden rule:** reach for the typed wrappers in `electron/lib/ipc/` instead of
> calling `ipcMain` / `ipcRenderer` / `webContents.send` directly. Its two folders,
> `handle/` and `bridge/`, are the only place raw Electron IPC belongs.

## Pick the direction

| Direction | Contract | Main | Preload |
|-----------|----------|------|---------|
| Request → response | `InvokeContract` | `handle` | `invoke` |
| Renderer → main, fire-and-forget | `SendContract` | `on` | `send` |
| Main → renderer event | `EventContract` | `emit` | `subscribe` |

Channels are named **`domain:action`** (e.g. `profiles:list`, `saves:normal:create`).

## Steps (invoke example: `foo:get`)

### 1. Declare the channel in its domain's invoke contract

`InvokeContract` (`apps/desktop/src/ipc/invoke-contract.type.ts`) joins one contract per domain:
`apps/desktop/src/ipc/invoke/*-invoke-contract.type.ts`, or a `<domain>-contract.type.ts` (or
folder) beside it. Add the line to the one your channel belongs to, or add a contract
and extend `InvokeContract` with it. This is the single source of truth for the signature:

```ts
'foo:get': (id: string) => Promise<FooResult>;
```

### 2. Map a friendly name in `apps/desktop/src/ipc/maps/invoke-map.data.ts`

Add one line to `INVOKE_MAP`, the only place the method↔channel link is written.
`satisfies` rejects a typo'd channel. `IpcApi` (the `window.api` type, in
`apps/desktop/src/ipc/api.type.ts`) and the preload method are derived automatically, so
`apps/desktop/src/env.d.ts` stays untouched.

```ts
getFoo: 'foo:get',
```

### 3. Implement the handler in `electron/<domain>/ipc-handlers.ts`

Use the typed `handle`; args and return type are inferred from the contract, so a
mismatch won't compile:

```ts
import { handle } from '../lib/ipc/handle';

const registerFooHandlers = (): void => {
  handle('foo:get', (_event, id) => getFoo(id)); // id: string, must return Promise<FooResult>
};

export { registerFooHandlers };
```

Register it by adding to the `IPC_HANDLERS` list in
`electron/startup/ipc-handlers.constants.ts` (`{ register: registerFooHandlers }`,
or `{ register, devOnly: true }` for dev-only tools).

### 4. Preload usually needs nothing

Flat methods are generated from the maps by `buildInvoke`/`buildSend`/`buildEvents`
(`electron/lib/ipc/bridge/`) in `electron/preload.ts`. The nested namespaces (`updater`, `shadowCasting`,
`screenEditor`) are wired by hand, so add there with the typed `invoke`/`subscribe`
if your channel belongs to one.

Call it from the renderer as `window.api.getFoo(id)`. The types come through.

## Events (`emit` / `subscribe`)

Add to `EventContract` (the value is the listener signature), then to
`EVENT_MAP` (`apps/desktop/src/ipc/maps/event-map.data.ts`) as `onFooChange: 'foo:change'`. Emit from main with
`emit(win, 'foo:change', payload)`; the renderer gets `window.api.onFooChange(cb)`
returning an unsubscribe function (generated).

## Checklist

- [ ] Channel named `domain:action`, with the correct direction (invoke/send/event).
- [ ] Signature added to the matching contract in `apps/desktop/src/ipc/`.
- [ ] Method↔channel line added to the join map (flat methods), or wired in a
      nested namespace (preload). Leave `env.d.ts` alone.
- [ ] Handler uses the typed `handle`/`on`/`emit` and is listed in `IPC_HANDLERS`.
- [ ] Raw `ipcMain`/`ipcRenderer`/`webContents.send` stays inside `electron/lib/ipc/`.
- [ ] `pnpm run lint` green (the contract makes any drift a type error).
- [ ] No native module imported into the renderer, and no security flags weakened.
