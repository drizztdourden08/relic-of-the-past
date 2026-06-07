<!-- @layer claude-config @kind doc -->
# Patterns in THIS Codebase

Where each pattern already fits or should be applied in Relic of the Past. Pattern
definitions/examples live in `design-patterns.md`; this maps them to our code.

## Governing rules
1. **Pattern follows smell.** Apply when its problem appears — never preemptively
   (that's Speculative Generality).
2. **Every plan names its patterns + shows the filetree** — see @docs/plan-format.md.
3. **Patterns are realized as small one-thing-per-file units** (≤200 lines, arrow
   fns, exports at end) — see @docs/coding-standards.md. Never a monolith.

## Creational
| Pattern | Where in this project |
|---------|-----------------------|
| Factory Method | navigation strategy per screen type; tile-attr decoder selection |
| Abstract Factory | input preset families (layout + glyphs + defaults) |
| Builder | `AssetBuilder` (`shared/asset-extraction`); navigation session assembly |
| Singleton | `wasm-bridge.ts` module singleton (Emscripten module ref) — module scope, not a class |

## Structural
| Pattern | Where |
|---------|-------|
| Adapter | typed wrappers over raw `ccall`/`HEAPU8`; `node-hid` events → input model |
| Facade | `lib/game/*` over dozens of `Wasm*`; each Electron `register*Handlers` |
| Bridge | overlay abstraction vs. GL backend (`edge-glow`, `shadow-casting` split helpers/renderer/shaders) |
| Proxy | `app-sprite://` protocol serving userData PNGs to the renderer |
| Composite | nested navigation regions / screen bundles |
| Decorator | cheats/feature flags layered over base game behavior |

## Behavioral
| Pattern | Where |
|---------|-------|
| Strategy | pathfinding/flood-fill (`navigation/strategies/`); per-controller mapping |
| Observer | `subscribeGameState`; Zustand stores; preload `on*` event subscriptions |
| Command | delivery queue (`delivery-queue.ts`); IPC `domain:action` messages |
| State | game lifecycle (idle/loading/running/paused); UI overlay modes |
| Template Method | `compile-*` extractors share a skeleton |
| Memento | save-states / SRAM snapshots |
| Chain of Responsibility | input processing pipeline; hook call-sites |
| Mediator | a store coordinating widgets |

When two patterns fit, prefer the one yielding the smallest, lowest-coupling set of
files. State the trade-off in the plan.
