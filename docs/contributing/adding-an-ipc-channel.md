<!-- @layer docs @kind doc -->
# Adding an IPC Channel

The renderer reaches the main process only through IPC. Every channel is typed
end-to-end against a single contract in `apps/desktop/src/ipc/`, so the compiler keeps the
three sites (handler, preload, renderer) in sync without relying on convention. See
[Electron & IPC](../architecture/electron-ipc.md) for the architecture.

> **Golden rule:** reach for Brock's typed wrappers (`handle`/`emit` from
> `@drizztdourden08/brock-electron/main`, the preload bridge from
> `@drizztdourden08/brock-electron/preload`) instead of calling `ipcMain` / `ipcRenderer` /
> `webContents.send` directly. Raw Electron IPC belongs inside Brock, never in app code.

## Pick the direction

| Direction | Contract | Main | Preload |
|-----------|----------|------|---------|
| Request and response | `InvokeContract` | `handle` | `invoke` |
| Renderer to main, fire-and-forget | `SendContract` | `on` | `send` |
| Main to renderer event | `EventContract` | `emit` | `subscribe` |

Channels are named **`domain:action`** (e.g. `store:duplicate`, `msu:optimize:run`).

## Steps (invoke example: `foo:get`)

### 1. Declare the channel in its domain's invoke contract

`InvokeContract` (`apps/desktop/src/ipc/invoke-contract.type.ts`) joins one contract per domain:
`apps/desktop/src/ipc/invoke/*-invoke-contract.type.ts`, or a `<domain>-contract.type.ts` (or
folder) beside it. Add the line to the one your channel belongs to, or add a contract
and extend `InvokeContract` with it. This is the single source of truth for the signature:

```ts
'foo:get': (id: string) => Promise<FooResult>;
```

### 2. Map a friendly name in `apps/desktop/src/ipc/contract.constants.ts`

Add one entry to `APP_CHANNELS`, the only place the link between a method and its channel
is written. The `invoke<...>()` helper ties the entry to the contract, so a typo'd channel
does not compile. `RotpNamespaces` (the `window.api` type, in `apps/desktop/src/ipc/namespaces.type.ts`)
and the preload method are derived automatically.

```ts
getFoo: invoke<RotpInvoke['foo:get']>()('foo:get'),
```

### 3. Implement the handler in `apps/desktop/electron/<domain>/ipc-handlers.ts`

Use the typed `handle`; args and return type are inferred from the contract, so a
mismatch won't compile:

```ts
import { handle } from '@drizztdourden08/brock-electron/main';

const registerFooHandlers = (): void => {
  handle('foo:get', (_event, id) => getFoo(id)); // id: string, must return Promise<FooResult>
};

export { registerFooHandlers };
```

Register it from the domain's handler group,
`apps/desktop/electron/handlers/foo-handlers.ts`:

```ts
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerFooHandlers } from '../foo/ipc-handlers';

const fooHandlers: HandlerGroup = { id: 'foo', register: () => registerFooHandlers() };

export { fooHandlers };
```

`brock sync` picks up every file in `apps/desktop/electron/handlers/` and writes the generated
`apps/desktop/.brock/handlers.main.ts`. Name the file `foo-handlers.dev.ts` for a dev-only tool.

### 4. Preload usually needs nothing

Flat methods are generated from the maps by `createPreloadBridge` in
`apps/desktop/electron/preload.ts`. The nested namespaces (`shadowCasting`, `screenEditor`)
are wired by hand in `apps/desktop/electron/preload-namespaces/`, so add there with the
typed `invoke` if your channel belongs to one.

Call it from the renderer as `window.api.getFoo(id)`. The
types come through.

## Events (`emit` / `subscribe`)

Add to `EventContract` (the value is the listener signature), then to `APP_CHANNELS` as
`onFooChange: event<RotpEvent['foo:change']>()('foo:change')`. Emit from main with
`emit(win, 'foo:change', payload)`; the renderer gets `appApi().onFooChange(cb)`
returning an unsubscribe function (generated).

## Checklist

- [ ] Channel named `domain:action`, with the correct direction (invoke/send/event).
- [ ] Signature added to the matching contract in `apps/desktop/src/ipc/`.
- [ ] Entry added to `APP_CHANNELS` (flat methods), or wired in a nested namespace (preload).
- [ ] Handler uses the typed `handle`/`on`/`emit` and is registered from a handler group in
      `apps/desktop/electron/handlers/`.
- [ ] No raw `ipcMain`/`ipcRenderer`/`webContents.send` in app code.
- [ ] `pnpm run lint` green (the contract makes any drift a type error).
- [ ] No native module imported into the renderer, and no security flags weakened.
