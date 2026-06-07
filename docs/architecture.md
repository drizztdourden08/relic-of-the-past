<!-- @layer docs @kind doc -->
# Architecture — Zones, Boundaries & Where Code Goes

The map for keeping this project structured: the zones, the **dependency invariants**
that must never be violated, and a **placement guide** for new code. Every feature is
analyzed against this before code is written (see the `architecture` skill).

Companion docs: @docs/design-system.md (UI tiers), @docs/coding-standards.md (file
rules), and the `refactoring-guru` skill (patterns/smells). Build/bridge specifics:
the `electron`, `add-wasm-function`, `build-wasm` skills.

## Zones

```
┌───────────────────────────C / WASM core  (core/)───────────────────────────┐
│ zelda3/ (vendored) - game-hooks/ (Wasm*/GameHook*) - wasm-build/           │
│ Touch only to add bridge fns / cheats / queries.                           │
└────────────────────────────────────────────────────────────────────────────┘
            │
            │  ccall / HEAPU8 / EM_ASM
            ▼
┌────────────────────Bridge  (apps/desktop/src/lib/game/)────────────────────┐
│ The ONLY TS that talks to the WASM module. Facade over Wasm* calls.        │
│ Renderer reaches the game through here - never raw ccall elsewhere.        │
└────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────Shared domain  (shared/ - used by BOTH renderer & electron)─────────┐
│ game/ pure domain (navigation, checks, items, data, logic, seed)           │
│ asset-extraction/ (ROM->.dat)   input/ (presets)   types/                  │
│ No React/DOM/Node/Electron/window in shared/game/.                         │
└────────────────────────────────────────────────────────────────────────────┘
              │                                               │
              │ @shared/*                         @shared/*   │
              ▼                                               ▼
┌─────Electron main / preload──────┐      ┌──Renderer  (apps/desktop/src/)───┐
│ Node/OS/fs/native (HID/USB),     │      │ design-system/ tokens            │
│ windows, protocols, profiles,    │ IPC  │ components/ - 4 tiers:           │
│ saves, ROMs, dialogs.            │─────►│   primitive|composite|           │
│                                  │◄─────│   compound|view (+widgets)       │
│ ipc-handlers -> register*()      │      │ stores/ lib/ hooks/ hud/         │
└──────────────────────────────────┘      └──────────────────────────────────┘
```

Aliases: `@shared/*` → `shared/`, `@app/*` → `apps/desktop/src/`.

## Dependency invariants (never violate these)

1. **`shared/*` is the leaf** — imports only other `shared/*` + stdlib. **Never**
   `@app/*` and **never** `electron`.
2. **`shared/game/*` is pure** — no React, no DOM, no Node, no Electron, no `window`.
   It must run in a plain test process.
3. **Renderer (`@app/*`)** may import `@shared/*`, design tokens, and `window.api`.
   It **must not** import from `apps/desktop/electron/*` — cross that boundary only
   through IPC.
4. **Electron (`apps/desktop/electron/*`)** may import `@shared/*`. It **must not**
   import renderer code (`@app/*`) or React.
5. **The WASM module is reached only through `lib/game/`** (the bridge Facade). No raw
   `ccall`/`HEAPU8` outside it.
6. **Bare UI tiers** (primitive/composite/compound) **must not** import stores,
   `window.api`, `lib/game`, or navigation. Data flows in via props; Views do wiring.
   (See @docs/design-system.md.)
7. **Native modules** (`node-hid`, `usb`) live in electron main/worker only.
8. **`core/` C** is edited only per the bridge rules (`add-wasm-function`).

If a change would break an invariant, the code is in the wrong zone — re-place it.

## Placement guide — "I'm adding X, where does it go?"

| The new code… | Goes in | Notes |
|----------------|---------|-------|
| Needs Node/OS/fs/native, windows, ROM/profile/save IO | `apps/desktop/electron/<domain>/` behind a `domain:action` IPC handler | + preload method + `env.d.ts`. Use the `electron` skill. |
| Talks to the running game / WASM | `apps/desktop/src/lib/game/` | New C function → `add-wasm-function` (C + both build files + bridge). |
| Pure game rule/algorithm/data, no React/Node | `shared/game/` (navigation / checks / items / data / logic / seed) | Must stay pure & testable. |
| Parses a ROM / builds assets | `shared/asset-extraction/` | One `compile-*` per domain. |
| Type shared by renderer + electron | `shared/types/` | Otherwise a local `types.ts`. |
| Generic UI atom (Button, Select) | `components/primitives/` | presentational, no data |
| Generic structural combo (Card, Dialog, Overlay) | `components/composites/` | presentational, no data |
| Domain-specific presentational card/form (ProfileCard, SaveSlot) | `components/compounds/` | takes a domain prop, fetches nothing |
| Feature/page with logic + data | `components/views/` or `widgets/` | owns stores/IPC/game; logic in `behavior/` |
| Renderer UI state | `apps/desktop/src/stores/` | Zustand |
| Shared renderer hook | `apps/desktop/src/hooks/` | non-feature-specific |
| Pure renderer helper | `apps/desktop/src/utils/` | no side effects |

## The rule: analyze before building

Before writing a feature, run the **architecture analysis** (the `architecture` skill):
1. **Decompose** the feature into pieces (UI, state, domain logic, data/IO, bridge, C).
2. **Place** each piece via the guide above.
3. **Verify** the dependency invariants hold for every placement.
4. **Pattern pass** (`refactoring-guru`) — name the pattern(s) each piece uses.
5. **Emit the plan** per @docs/plan-format.md — CRUD filetree, data model in TS, flow.

No feature work starts without this analysis and a plan.
