<!-- @layer docs @kind doc -->
# Coding Standards

This project favors small, focused files and a predictable shape, so the codebase stays easy to read and to move around in. Here's how we write code, and why.

## Small, single-purpose files

Every file does one thing: one component, one hook, one utility, one group of types, one set of constants. When a file grows past about 200 lines, that's the cue to split it. A file that does one thing rarely needs more room, and smaller files are easier to test, reuse, and reason about.

## Arrow functions

We use arrow functions for components, hooks, and utilities rather than `function` declarations, so definitions read the same way everywhere.

## Exports at the end

Declarations stay clean, with no inline `export` keyword. Group the exports together at the bottom of the file:

```ts
const MyComponent = () => { ... };
type Props = { ... };

export { MyComponent };
export type { Props };
```

Barrel `index.ts` files are the exception: they only re-export, as in `export { X } from './X'`.

## Destructure on the first line

When a function, hook, or component takes a params or props object, destructure it on the first line of the body. That documents what the code actually uses, right up front.

## Group by concept, in deep folders

Prefer deep, logical folders over flat dumps, with related files together under a folder named for the concept they serve. Each non-trivial component gets its own folder:

```
ComponentName/
├── ComponentName.tsx           main component
├── ComponentName.css           scoped styles
├── ComponentName.type.ts       shared types
├── ComponentName.constants.ts  static data and configs
├── behavior/                   one hook per file
├── sub-components/             children used only here
└── index.ts                    barrel re-export
```

A small single-file component doesn't need a folder, and there's no need to over-split — a folder holding one trivial file isn't worth it unless it will clearly grow.

## Hooks

Use a zero-argument hook when it's self-contained, a few positional arguments for two to four simple dependencies, and a params object once there are callbacks or many config values. Hooks return a named object rather than a tuple.

## Naming

- Hooks: `useXyz`, for example `useGameLifecycle`.
- Components and types: `PascalCase`, with no `I` prefix.
- Utilities: `camelCase` verb-noun, for example `serializeToIni`.
- Event handlers: `handleXyz` internally, `onXyz` for props passed to children.
- Booleans: `isXyz` or `showXyz`.

## TypeScript

Use `type` or `interface`, whichever fits, and keep a module's types together in their own `types.ts`. Import types with `import type { ... }`. Avoid `any` unless you're interfacing with something untyped, and leave a comment when you do.

## React

Functional components only. Reach for `useCallback` on handlers passed as props, clean up subscriptions in `useEffect`, and pull inline object or array literals out of JSX props (into `useMemo` or constants) so they don't trigger needless re-renders.

## Design patterns

When a familiar problem turns up, use the pattern that fits and mention it in your plan. Clear structure and the right pattern matter more than cleverness.

---

ESLint and a few project checks back these conventions up, so most slips get caught automatically. The real goal, though, is readable and well-organized code, not just a passing linter.
