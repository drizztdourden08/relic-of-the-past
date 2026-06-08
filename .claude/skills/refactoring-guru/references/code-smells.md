<!-- @layer claude-config @kind doc -->
# Code Smells Catalog

Catalog: <https://refactoring.guru/refactoring/smells> — link a smell as
`https://refactoring.guru/smells/<slug>`. Each entry: **what it is → how to identify
→ tiny example → fixes** (refactoring techniques, see `refactoring-techniques.md`).

---

## Bloaters — code that has grown too large to handle

### Long Method — `/smells/long-method`

- **What:** a method/function doing too much; long bodies.
- **Identify:** you scroll to read it; comments separate "sections"; >~15–20 lines.
- **Example:** a `handleSubmit` that validates, transforms, calls API, and updates UI.
- **Fixes:** Extract Method, Replace Temp with Query, Decompose Conditional, Replace Method with Method Object.

### Large Class — `/smells/large-class`

- **What:** a class/module with too many fields/methods/responsibilities.
- **Identify:** unrelated groups of fields; "and" in its description; (here) a file pushing the 200-line cap.
- **Fixes:** Extract Class, Extract Subclass, Extract Interface.

### Primitive Obsession — `/smells/primitive-obsession`

- **What:** using primitives (string/number) instead of small objects for domain concepts.
- **Identify:** `roomId: number` everywhere with scattered validation; constants for "type codes"; data passed as loose fields.
- **Example:** `tileX: number, tileY: number` threaded everywhere instead of a `TileCoord`.
- **Fixes:** Replace Data Value with Object, Introduce Parameter Object, Replace Type Code with Class/Subclasses/Strategy, Replace Magic Number with Symbolic Constant.

### Long Parameter List — `/smells/long-parameter-list`

- **What:** 4+ parameters.
- **Identify:** call sites are hard to read; booleans/flags in the signature.
- **Fixes:** Introduce Parameter Object, Preserve Whole Object, Replace Parameter with Method Call. (Matches the repo's "destructure a params object on line 1.")

### Data Clumps — `/smells/data-clumps`

- **What:** the same group of fields appears together repeatedly.
- **Identify:** `x, y, width, height` (or `r, g, b, a`) recurring across signatures/types.
- **Fixes:** Extract Class, Introduce Parameter Object, Preserve Whole Object.

---

## Object-Orientation Abusers — incomplete/incorrect use of OO

### Switch Statements — `/smells/switch-statements`

- **What:** a `switch`/`if-else` chain on a type code, duplicated across the codebase.
- **Identify:** the same `switch (kind)` in multiple places; adding a case means editing many spots (→ Shotgun Surgery).
- **Example:** `switch (screenType) { case 'overworld': … case 'dungeon': … }` in 3 files.
- **Fixes:** Replace Conditional with Polymorphism, Replace Type Code with Subclasses/State/Strategy, Introduce Null Object.

### Temporary Field — `/smells/temporary-field`

- **What:** a field set only in certain circumstances, empty otherwise.
- **Identify:** fields that are `null` most of the object's life; methods guarding on them.
- **Fixes:** Extract Class, Introduce Null Object.

### Refused Bequest — `/smells/refused-bequest`

- **What:** a subclass uses only some of what it inherits; the rest is unwanted.
- **Identify:** overrides that throw/no-op; "is-a" that isn't really.
- **Fixes:** Replace Inheritance with Delegation, Extract Superclass.

### Alternative Classes with Different Interfaces — `/smells/alternative-classes-with-different-interfaces`

- **What:** two classes do the same thing but have different method names.
- **Identify:** you can't swap them despite identical roles.
- **Fixes:** Rename Method, Move Method, Extract Superclass (unify the interface — an Adapter may help).

---

## Change Preventers — one change forces many others

### Divergent Change — `/smells/divergent-change`

- **What:** one module changes for many different reasons.
- **Identify:** "I edit this file whether the change is about audio, input, or saves." (Violates SRP.)
- **Fixes:** Extract Class, Move Method/Field.

### Shotgun Surgery — `/smells/shotgun-surgery`

- **What:** one conceptual change forces tiny edits across many files.
- **Identify:** adding a new item/state means touching 6 files (cf. the WASM export drift).
- **Fixes:** Move Method/Field, Inline Class (consolidate the scattered responsibility).

### Parallel Inheritance Hierarchies — `/smells/parallel-inheritance-hierarchies`

- **What:** every subclass in hierarchy A forces a matching subclass in B.
- **Identify:** creating `FooStrategy` always needs a `FooConfig`.
- **Fixes:** Move Method/Field to collapse one hierarchy into the other.

---

## Dispensables — things whose absence makes code cleaner

### Comments — `/smells/comments`

- **What:** comments compensating for unclear code.
- **Identify:** a comment explaining *what* a block does (vs. *why*).
- **Fixes:** Extract Method/Variable with a good name, Rename Method, Introduce Assertion. (Keep *why* comments.)

### Duplicate Code — `/smells/duplicate-code`

- **What:** the same structure in multiple places.
- **Identify:** copy-paste; the "rule of two" tripped.
- **Fixes:** Extract Method, Pull Up Method, Form Template Method, Extract Class/Superclass.

### Lazy Class — `/smells/lazy-class`

- **What:** a class/file that doesn't do enough to justify itself.
- **Identify:** a one-line wrapper, an over-split folder with a trivial file.
- **Fixes:** Inline Class, Collapse Hierarchy.

### Data Class — `/smells/data-class`

- **What:** a class with only fields/getters and no behavior.
- **Identify:** all logic about the data lives elsewhere (often Feature Envy nearby). NOTE: plain TS `type`/DTOs are fine — this smell is about *classes* that should own behavior.
- **Fixes:** Move Method (move behavior in), Encapsulate Field/Collection.

### Dead Code — `/smells/dead-code`

- **What:** code never executed.
- **Identify:** unreferenced exports, unreachable branches, flags always false.
- **Fixes:** Delete it (and the no-longer-needed parameters — Remove Parameter).

### Speculative Generality — `/smells/speculative-generality`

- **What:** abstraction built for a future that never came ("just in case").
- **Identify:** unused hooks/params, abstract bases with one impl, a pattern applied with no present need.
- **Fixes:** Collapse Hierarchy, Inline Class/Method, Remove Parameter, Rename. (The antidote to over-patterning.)

---

## Couplers — excessive coupling between classes

### Feature Envy — `/smells/feature-envy`

- **What:** a method more interested in another object's data than its own.
- **Identify:** a function reaching repeatedly into `other.a`, `other.b`, `other.c`.
- **Example:** a util computing from a `Profile`'s internals instead of `Profile` doing it.
- **Fixes:** Move Method, Extract Method then Move.

### Inappropriate Intimacy — `/smells/inappropriate-intimacy`

- **What:** two modules know too much about each other's internals.
- **Identify:** bidirectional reach-ins; private-ish access across a boundary.
- **Fixes:** Move Method/Field, Hide Delegate, Replace Inheritance with Delegation.

### Message Chains — `/smells/message-chains`

- **What:** `a.getB().getC().getD()` train wrecks.
- **Identify:** chained accessors; callers depend on the whole navigation path.
- **Fixes:** Hide Delegate, Extract Method.

### Middle Man — `/smells/middle-man`

- **What:** a class that only delegates to another.
- **Identify:** most methods are one-line forwards.
- **Fixes:** Remove Middle Man, Inline Class. (Opposite of Hide Delegate — balance the two.)

### Incomplete Library Class — `/smells/incomplete-library-class`

- **What:** a third-party class missing methods you need, can't edit.
- **Identify:** you wish you could add a method to `node-hid`/a vendor type.
- **Fixes:** Introduce Foreign Method, Introduce Local Extension (or an Adapter wrapper).
