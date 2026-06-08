<!-- @layer claude-config @kind doc -->
# Refactoring Techniques Catalog

Catalog: <https://refactoring.guru/refactoring/techniques> — link a technique as
`https://refactoring.guru/<slug>`. Every technique is listed with a short
description + when to use. The **commonly-used** ones have a worked example;
for the long tail the description + link is the reference.

> Always refactor in small steps with tests/typecheck green between steps.

---

## Composing Methods — clean up the inside of methods

### Extract Method — `/extract-method` ⭐

Pull a code fragment into its own well-named function. The #1 cure for Long Method,
Duplicate Code, and Comments.

```ts
// before
const render = () => { /* …setup… */ ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); };
// after
const drawTile = (x, y, w, h) => { ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); };
const render = () => { /* …setup… */ drawTile(x, y, w, h); };
```

### Inline Method — `/inline-method`

When a method body is as clear as its name, replace calls with the body and delete it.

### Extract Variable — `/extract-variable` ⭐

Give a sub-expression a name to explain it.

```ts
// before
if (link.x > 0 && link.x < 512 && link.y > 0 && link.y < 512) { … }
// after
const onScreen = link.x > 0 && link.x < 512 && link.y > 0 && link.y < 512;
if (onScreen) { … }
```

### Inline Temp — `/inline-temp`

A temp assigned once to a simple expression and used once → inline it.

### Replace Temp with Query — `/replace-temp-with-query` ⭐

Move a temp's computing expression into a function so it can be reused and the host
method shrinks.

```ts
const basePrice = () => quantity * itemPrice;   // was: const basePrice = quantity * itemPrice;
```

### Split Temporary Variable — `/split-temporary-variable`

A temp reused for different purposes → one variable per purpose (each `const`).

### Remove Assignments to Parameters — `/remove-assignments-to-parameters`

Don't reassign a parameter; use a local. Keeps inputs meaningful.

### Replace Method with Method Object — `/replace-method-with-method-object`

A long method with many locals → turn it into its own object whose fields are those
locals, so you can Extract Method freely. (Often a step toward a pattern.)

### Substitute Algorithm — `/substitute-algorithm`

Replace a convoluted algorithm body with a clearer equivalent.

---

## Moving Features Between Objects — put behavior where the data is

### Move Method — `/move-method` ⭐

Method used more by another class than its own → move it there. Cures Feature Envy.

### Move Field — `/move-field`

Field used more by another class → move it.

### Extract Class — `/extract-class` ⭐

One class doing the work of two → split responsibilities into a new class. Cures
Large Class, Divergent Change, Data Clumps.

### Inline Class — `/inline-class`

A class doing too little (Lazy/Middle Man) → fold it into its only client.

### Hide Delegate — `/hide-delegate`

Replace `a.getB().doIt()` with `a.doIt()` so clients don't navigate internals. Cures
Message Chains.

### Remove Middle Man — `/remove-middle-man`

If a class only forwards, let clients call the delegate directly. (Balance vs. Hide Delegate.)

### Introduce Foreign Method — `/introduce-foreign-method`

Need a method on a class you can't change → write a helper taking that class as its
first arg.

### Introduce Local Extension — `/introduce-local-extension`

Need several methods on an unmodifiable class → wrap/subclass it (an Adapter).

---

## Organizing Data

### Self Encapsulate Field — `/self-encapsulate-field`

Access a field via getter/setter even internally, to allow overriding/validation.

### Replace Data Value with Object — `/replace-data-value-with-object` ⭐

A primitive that needs behavior/validation becomes a small object. Cures Primitive
Obsession. e.g. `roomId: number` → `RoomId` with validation/helpers.

### Change Value to Reference — `/change-value-to-reference` · Change Reference to Value — `/change-reference-to-value`

Switch between many equal copies (value) and a single shared instance (reference)
depending on identity/mutability needs.

### Duplicate Observed Data — `/duplicate-observed-data`

Domain data needed in the UI layer → keep it in the domain and sync to the UI via
Observer. (cf. store subscriptions.)

### Replace Array with Object — `/replace-array-with-object`

A tuple/array whose positions mean different things → named fields/object.

### Encapsulate Field — `/encapsulate-field`

Make a public field private with accessors.

### Encapsulate Collection — `/encapsulate-collection`

Return a read-only view of a collection; mutate via add/remove methods.

### Replace Magic Number with Symbolic Constant — `/replace-magic-number-with-symbolic-constant` ⭐

Name literal values. e.g. `512` → `SCREEN_PX`. (Pairs with the design-system "tokens, no magic px" rule.)

### Replace Type Code with Class — `/replace-type-code-with-class`

A numeric/string type code → a class with a fixed set of instances.

### Replace Type Code with Subclasses — `/replace-type-code-with-subclasses`

Type code that drives behavior → subclasses. Step toward Replace Conditional with Polymorphism.

### Replace Type Code with State/Strategy — `/replace-type-code-with-state-strategy` ⭐

Type code that changes behavior at runtime → State or Strategy objects. Cures Switch Statements.

### Replace Subclass with Fields — `/replace-subclass-with-fields`

Subclasses differing only by constant data → one class with fields.

---

## Simplifying Conditional Expressions

### Decompose Conditional — `/decompose-conditional` ⭐

Extract the condition and each branch into named methods.

```ts
// before
if (date.before(SUMMER_START) || date.after(SUMMER_END)) charge = winterCharge(qty);
// after
if (notSummer(date)) charge = winterCharge(qty);
```

### Consolidate Conditional Expression — `/consolidate-conditional-expression`

Several checks with the same result → one combined condition (then Extract Method).

### Consolidate Duplicate Conditional Fragments — `/consolidate-duplicate-conditional-fragments`

Code repeated in every branch → move it out of the conditional.

### Replace Nested Conditional with Guard Clauses — `/replace-nested-conditional-with-guard-clauses` ⭐

Return early on edge cases instead of nesting.

```ts
// before
const pay = () => { let r; if (dead) r = deadAmount(); else { if (retired) r = retiredAmount(); else r = normalAmount(); } return r; };
// after
const pay = () => { if (dead) return deadAmount(); if (retired) return retiredAmount(); return normalAmount(); };
```

### Replace Conditional with Polymorphism — `/replace-conditional-with-polymorphism` ⭐

A conditional choosing behavior by type → polymorphic objects (Strategy/State). The
big cure for Switch Statements.

### Remove Control Flag — `/remove-control-flag`

Replace a `done`/`found` boolean loop flag with `break`/`return`.

### Introduce Null Object — `/introduce-null-object` ⭐

Replace repeated `=== null` checks with a NullX object that has neutral behavior.

### Introduce Assertion — `/introduce-assertion`

Make an assumed-always-true condition explicit with an assertion.

---

## Simplifying Method Calls

### Rename Method — `/rename-method` ⭐

Make the name reveal intent. (cf. naming conventions.)

### Add Parameter — `/add-parameter` · Remove Parameter — `/remove-parameter`

Adjust the signature to what the method actually needs (remove unused → kills Dead Code).

### Separate Query from Modifier — `/separate-query-from-modifier`

A method that returns a value *and* has side effects → split into a query and a command.

### Parameterize Method — `/parameterize-method`

Several near-identical methods differing by a constant → one method taking that value.

### Introduce Parameter Object — `/introduce-parameter-object` ⭐

Replace a long parameter list / data clump with one object. (Pairs with destructure-on-line-1.)

### Preserve Whole Object — `/preserve-whole-object`

Pass the whole object instead of pulling several values out of it first.

### Remove Setting Method — `/remove-setting-method`

Make a field set-once (immutable after construction).

### Replace Parameter with Explicit Methods — `/replace-parameter-with-explicit-methods`

A method branching on an enum param → separate named methods.

### Replace Parameter with Method Call — `/replace-parameter-with-method-call`

If the callee can compute a value itself, don't pass it.

### Hide Method — `/hide-method`

Reduce visibility of a method not used outside its class.

### Replace Constructor with Factory Method — `/replace-constructor-with-factory-method` ⭐

Move construction behind a named factory (enables the Factory Method pattern).

### Replace Error Code with Exception — `/replace-error-code-with-exception`

Return-code error handling → throw (or, in TS, a typed Result).

### Replace Exception with Test — `/replace-exception-with-test`

Don't use exceptions for conditions you can cheaply check first.

---

## Dealing with Generalization — manage inheritance

### Pull Up Field — `/pull-up-field` · Pull Up Method — `/pull-up-method` · Pull Up Constructor Body — `/pull-up-constructor-body`

Move members common to subclasses up into the superclass. Cures Duplicate Code.

### Push Down Field — `/push-down-field` · Push Down Method — `/push-down-method`

Move members used by only one subclass down into it.

### Extract Subclass — `/extract-subclass` · Extract Superclass — `/extract-superclass` · Extract Interface — `/extract-interface` ⭐

Factor shared/variant behavior into a new sub/super class or interface. Extract
Interface defines a contract for Strategy/Adapter/DI.

### Collapse Hierarchy — `/collapse-hierarchy`

Sub/superclass barely differ → merge them. Cures Speculative Generality/Lazy Class.

### Form Template Method — `/form-template-method` ⭐

Two methods with the same steps in the same order but differing details → pull the
skeleton up, leave the steps abstract (Template Method pattern).

### Replace Inheritance with Delegation — `/replace-inheritance-with-delegation` ⭐

Subclass uses only part of the base (Refused Bequest) → hold the base as a field and
delegate. "Favor composition over inheritance."

### Replace Delegation with Inheritance — `/replace-delegation-with-inheritance`

Lots of boilerplate forwarding to a delegate → inherit instead (use sparingly).
