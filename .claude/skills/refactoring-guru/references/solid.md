<!-- @layer claude-config @kind doc -->
# SOLID Principles

Five object-oriented design principles (Robert C. Martin) that keep code flexible
and maintainable. They underpin most patterns and refactorings. (Note: SOLID isn't a
dedicated refactoring.guru catalog page; the two related design principles it *does*
host are **"Program to an interface, not an implementation"** and **"Favor
composition over inheritance"** — both relevant below.) Each entry: **statement →
how to spot a violation → bad→good.**

---

## S — Single Responsibility Principle

- **Statement:** a module should have **one reason to change**.
- **Spot a violation:** Divergent Change / Large Class — the same file edited for
  unrelated reasons (audio *and* input *and* saving). (Maps directly to the repo's
  one-thing-per-file + ≤200-line rules.)

```ts
// bad: parses, validates, AND persists
const saveProfile = (raw: string) => { const p = parse(raw); if (!p.name) throw…; fs.write(p); };
// good: one responsibility each
const parseProfile = (raw: string): Profile => …;
const validateProfile = (p: Profile): void => …;
const persistProfile = (p: Profile): void => …;
```

## O — Open/Closed Principle

- **Statement:** open for extension, **closed for modification** — add behavior
  without editing existing code.
- **Spot a violation:** Switch Statements / Shotgun Surgery — adding a case means
  editing a central `switch`.

```ts
// bad: every new strategy edits this switch
const find = (algo: string, a: Tile, b: Tile) => { switch (algo) { case 'astar': … case 'flood': … } };
// good: extend by adding a Strategy object; this code never changes
const find = (s: PathStrategy, a: Tile, b: Tile) => s.find(a, b);
```

## L — Liskov Substitution Principle

- **Statement:** subtypes must be usable **anywhere** their base type is, without
  surprising behavior.
- **Spot a violation:** Refused Bequest — an override that throws, no-ops, or
  tightens preconditions; `instanceof` checks to special-case a subtype.

```ts
// bad: subtype breaks the contract
class ReadOnlyStore extends Store { save() { throw new Error('nope'); } }
// good: don't inherit a capability you can't honor — split the interface (see ISP)
```

## I — Interface Segregation Principle

- **Statement:** no client should depend on methods it doesn't use; prefer **small,
  focused interfaces**.
- **Spot a violation:** implementers stubbing/throwing on methods they don't need;
  fat "manager" interfaces.

```ts
// bad: one fat interface
type Device = { read(): Data; write(d: Data): void; vibrate(): void };
// good: segregate
type Readable = { read(): Data };
type Writable = { write(d: Data): void };
type Haptic = { vibrate(): void };
```

## D — Dependency Inversion Principle

- **Statement:** depend on **abstractions, not concretions**; high-level policy
  shouldn't import low-level details. ("Program to an interface.")
- **Spot a violation:** a view/business module importing a concrete fs/IPC/WASM
  module directly; hard-to-test units because the dependency is `new`'d inside.

```ts
// bad: logic hard-wired to a concrete source
const loadSlots = () => fs.readdir(userDataPath('saves'));
// good: depend on an injected abstraction (Adapter/Strategy supplies the concrete)
type SlotSource = { list(): Promise<Slot[]> };
const useSaveSlots = (src: SlotSource) => src.list();
```

(In this project: presentational tiers depend on props/callbacks, not stores/IPC —
that boundary is DIP in practice. See @docs/design-system.md.)

---

## How SOLID connects

- **SRP** → Extract Class/Method; cures Divergent Change.
- **OCP** → Strategy/State/Factory; cures Switch Statements.
- **LSP** → Replace Inheritance with Delegation; cures Refused Bequest.
- **ISP** → Extract Interface; cures fat interfaces.
- **DIP** → program to interfaces + inject; cures Inappropriate Intimacy and makes
  units testable.
