<!-- @layer claude-config @kind doc -->
# Design Patterns Catalog (GoF)

What is a pattern: <https://refactoring.guru/design-patterns/what-is-pattern> ·
Catalog: <https://refactoring.guru/design-patterns/catalog> — link a pattern as
`https://refactoring.guru/design-patterns/<slug>`.

A pattern is a **typical solution to a recurring design problem** — a blueprint, not
copy-paste code. Apply one only when its problem (often a code smell) is actually
present. Each entry: **intent → the smell/need that calls for it → how to identify →
tiny TS example**.

---

## Creational — object creation mechanisms

### Factory Method — `/design-patterns/factory-method`

- **Intent:** create objects through a method so subclasses/callers pick the concrete type.
- **Calls for it:** Switch Statements on a type code at construction; you `new` different classes by a kind.
- **Identify:** `switch(kind){ case…: return new A() … }` scattered around.

```ts
type Strategy = { run(): void };
const makeStrategy = (kind: 'flood' | 'astar'): Strategy =>
  kind === 'flood' ? new FloodFill() : new AStar();   // one place to choose
```

### Abstract Factory — `/design-patterns/abstract-factory`

- **Intent:** create *families* of related objects without naming concretes.
- **Calls for it:** related objects must be created consistently together.
- **Identify:** you build a set (layout + glyphs + defaults) that must match.

```ts
type InputKit = { layout: Layout; glyphs: Glyphs; defaults: Bindings };
const makeKit = (pad: PadType): InputKit => padFactories[pad]();
```

### Builder — `/design-patterns/builder`

- **Intent:** construct a complex object step by step.
- **Calls for it:** Long Parameter List / telescoping constructors; staged assembly.
- **Identify:** ctor with many optional args. (The repo's `AssetBuilder` is this.)

```ts
const dat = new AssetBuilder().addUint8('a', a).addUint16('b', b).build();
```

### Prototype — `/design-patterns/prototype`

- **Intent:** copy existing objects without coupling to their classes.
- **Calls for it:** expensive-to-build objects you need many near-copies of.
- **Identify:** `clone()` plus tweak, instead of rebuilding from scratch.

```ts
const variant = { ...baseTileConfig, palette: 3 };
```

### Singleton — `/design-patterns/singleton`

- **Intent:** exactly one instance, globally accessible.
- **Calls for it:** a single shared resource (the WASM module).
- **Identify:** "there must be only one." Prefer a **module singleton** over a class
  for testability — like `wasm-bridge.ts`. (Use sparingly; it's global state.)

```ts
let mod: Module | null = null;            // module-scope single instance
const getModule = () => mod;
```

---

## Structural — assemble objects into larger structures

### Adapter — `/design-patterns/adapter`

- **Intent:** make an incompatible interface usable through a wrapper.
- **Calls for it:** Incomplete Library Class; foreign API shape ≠ yours.
- **Identify:** raw `ccall`/`HEAPU8` or `node-hid` events used directly everywhere.

```ts
const readViewport = (): Viewport => {            // adapts raw ptr+HEAPU8 to a typed object
  const p = mod.ccall('WasmGetViewportInfo', 'number', [], []);
  return { x: mod.HEAPU8[p], y: mod.HEAPU8[p + 1] };
};
```

### Bridge — `/design-patterns/bridge`

- **Intent:** split an abstraction from its implementation so both vary independently.
- **Calls for it:** a class explodes into a matrix (Shape×Renderer).
- **Identify:** parallel hierarchies; you'd otherwise make `GLOverlay`, `CanvasOverlay`… per overlay type.

```ts
type Backend = { drawRect(r: Rect): void };
const overlay = (b: Backend) => ({ render: (rects: Rect[]) => rects.forEach(b.drawRect) });
```

### Composite — `/design-patterns/composite`

- **Intent:** treat individual objects and trees of objects uniformly.
- **Calls for it:** part-whole hierarchies handled with the same API.
- **Identify:** recursive structures with `if (isLeaf)` branches.

```ts
type Node = { size(): number };
const group = (children: Node[]): Node => ({ size: () => children.reduce((n, c) => n + c.size(), 0) });
```

### Decorator — `/design-patterns/decorator`

- **Intent:** add behavior by wrapping, without subclass explosion.
- **Calls for it:** optional, combinable features layered over a base.
- **Identify:** boolean flags multiplying behavior; you'd make `XWithYAndZ` classes.

```ts
const withLogging = (fn: Fn): Fn => (...a) => { log(a); return fn(...a); };
```

### Facade — `/design-patterns/facade`

- **Intent:** a simple front over a complex subsystem.
- **Calls for it:** callers wrangle many low-level calls.
- **Identify:** clients import 10 internals to do one thing. (`lib/game/*` over dozens of `Wasm*`; an Electron `register*Handlers` over fs/native.)

```ts
const game = { pause: wasmSetPaused, save: wasmSaveState, give: wasmCheatGiveItem };
```

### Flyweight — `/design-patterns/flyweight`

- **Intent:** share common state across many objects to save memory.
- **Calls for it:** huge numbers of similar objects (tiles, sprites, particles).
- **Identify:** memory blows up from duplicated immutable data per instance.

```ts
const tileTypes = new Map<number, TileType>();   // shared; instances store only id + pos
```

### Proxy — `/design-patterns/proxy`

- **Intent:** a stand-in controlling access (lazy load, cache, guard, remote).
- **Calls for it:** access control, caching, or serving a resource indirectly.
- **Identify:** you wrap access to add caching/permission/protocol. (The `app-sprite://` protocol proxies userData PNGs.)

---

## Behavioral — algorithms & responsibilities between objects

### Chain of Responsibility — `/design-patterns/chain-of-responsibility`

- **Intent:** pass a request along handlers until one handles it.
- **Calls for it:** ordered, optional processing stages.
- **Identify:** growing `if/else` deciding who handles an input/event.

```ts
type Handler = (e: InputEvent, next: () => void) => void;
const run = (hs: Handler[], e: InputEvent) => { const go = (i: number) => hs[i]?.(e, () => go(i + 1)); go(0); };
```

### Command — `/design-patterns/command`

- **Intent:** turn a request into an object (queue, log, undo).
- **Calls for it:** you need to queue/replay/undo actions. (delivery queue; IPC `domain:action`.)
- **Identify:** actions passed around as data with params.

```ts
type Command = { execute(): void; undo?(): void };
const queue: Command[] = [];
```

### Iterator — `/design-patterns/iterator`

- **Intent:** traverse a collection without exposing its structure.
- **Calls for it:** custom traversal over a non-trivial structure (a grid/graph).
- **Identify:** callers poke at internal arrays to walk them.

```ts
function* walkTiles(g: Grid) { for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) yield g.at(x, y); }
```

### Mediator — `/design-patterns/mediator`

- **Intent:** centralize complex comms so components don't reference each other.
- **Calls for it:** Inappropriate Intimacy; many-to-many wiring.
- **Identify:** components import each other directly to coordinate. (A store can mediate widgets.)

### Memento — `/design-patterns/memento`

- **Intent:** capture/restore an object's state without exposing internals.
- **Calls for it:** snapshots, undo, save/load. (save-states / SRAM snapshots.)
- **Identify:** you serialize/restore state blobs.

```ts
const snapshot = () => structuredClone(state);   // opaque token; restore later
```

### Observer — `/design-patterns/observer`

- **Intent:** notify many subscribers of state changes.
- **Calls for it:** Duplicate Observed Data; UI must react to domain changes.
- **Identify:** polling, or manual "tell everyone" calls. (`subscribeGameState`; Zustand; preload `on*` events.)

```ts
const subscribe = (fn: (s: State) => void) => { listeners.add(fn); return () => listeners.delete(fn); };
```

### State — `/design-patterns/state`

- **Intent:** change behavior when internal state changes; states as objects.
- **Calls for it:** Switch Statements on a mode scattered around. (game lifecycle: idle/loading/running/paused; UI overlay modes.)
- **Identify:** `if (status === 'running')` repeated across methods.

```ts
const states = { idle: { tick() {} }, running: { tick() { stepFrame(); } } };
const tick = () => states[status].tick();
```

### Strategy — `/design-patterns/strategy`

- **Intent:** interchangeable algorithms behind one interface.
- **Calls for it:** Switch Statements selecting an algorithm. (pathfinding `navigation/strategies/`; per-controller mapping.)
- **Identify:** `switch(algo)` choosing how to compute.

```ts
type PathStrategy = { find(a: Tile, b: Tile): Tile[] };
const plan = (s: PathStrategy, a: Tile, b: Tile) => s.find(a, b);
```

### Template Method — `/design-patterns/template-method`

- **Intent:** fixed algorithm skeleton, subclasses fill steps.
- **Calls for it:** Duplicate Code where steps share order but differ in detail. (the `compile-*` extractors share a shape.)
- **Identify:** several functions with the same outline copy-pasted.

```ts
const extract = (rom: Rom, steps: Steps) => { const raw = steps.read(rom); return steps.decode(raw); };
```

### Visitor — `/design-patterns/visitor`

- **Intent:** add operations to an object structure without changing its classes.
- **Calls for it:** many unrelated ops over a stable node hierarchy.
- **Identify:** you keep adding `switch(node.kind)` ops across the tree. (Use sparingly — heavy.)

---

## Choosing quickly

- Branch on a type to **create** → Factory Method; to **behave** → Strategy/State.
- Hide a **messy subsystem** → Facade; make **foreign code fit** → Adapter.
- **Decouple change producers from consumers** → Observer.
- **Queue/undo actions** → Command; **snapshot/restore** → Memento.
- **Staged/optional construction** → Builder.
- When two fit, pick the one yielding the smallest, lowest-coupling set of files. State the trade-off in the plan.
