<!-- @layer docs @kind doc -->
# Coding Standards

This project favors small, focused files and a predictable shape, so the codebase stays easy to read and to move around in. Here's how we write code, and why.

## Small, single-purpose files

Every file does one thing: one component, one hook, one utility, one group of types, one set of constants. When a file grows past about 200 lines, that's the cue to split it. A file that does one thing rarely needs more room, and smaller files are easier to test, reuse, and reason about.

## Arrow functions

We use arrow functions for components, hooks, and utilities instead of `function` declarations, so definitions read the same way everywhere.

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

A small single-file component doesn't need a folder, and there's no need to over-split. A folder holding one trivial file isn't worth it unless it will clearly grow.

## Hooks

Use a zero-argument hook when it's self-contained, a few positional arguments for two to four simple dependencies, and a params object once there are callbacks or many config values. Hooks return a named object, not a tuple.

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

## Writing: comments, strings, and docs

Comments, UI strings, and docs are held to the same bar as the code: short sentences, plain words, no padding. Three lint rules block the writing habits that keep coming back. They run over TS/JS comments, string literals, and JSX text; over Markdown prose; and, through the analyze harness, over C, CSS, shell, and config files.

| Rule (ESLint / markdownlint) | Blocks | Write |
|---|---|---|
| `local/no-em-dash` / `ROTP001` | em dash, en dash | Rewrite the sentence. See below. |
| `local/no-smart-punctuation` / `ROTP002` | unicode ellipsis, curly quotes | `...`, `'`, `"` |
| `local/no-slop-prose` / `ROTP003` | `rather than`; `not just X, but Y`; stock phrases (`in order to`, `as well as`, `keep in mind`, `make sure to`); sentence-opening connectors (`Furthermore`, `Note that`, `That said`); slop words (`robust`, `seamless`, `crucial`, `leverage`, `enhance`, `optimal`); filler adverbs (`simply`, `truly`, `cleanly`); `ensure` as a prose verb | a plain word, or delete the phrase |

None of the three has an auto-fix, and that is the point. A mechanical swap is the exact mistake these rules exist to catch.

### The dash rule: rewrite, do not substitute

A dash is a sentence-shape problem, not a punctuation problem. The shape is a main clause, a dash, then an aside that restates or escalates the claim. Swapping the dash for a colon, a comma, or a spaced hyphen leaves that shape untouched. Read the sentence, then pick the fix:

- Two separate thoughts: split them into two sentences.
- A restatement: delete it and keep the clearer half.
- A definition or a list: a colon, when a colon was the honest punctuation all along.
- A qualifier: fold it into the clause, or cut it.
- A subordinate clause: rejoin it with because, so, when, which, or after.

A numeric range (`1-2`), a table separator, and a UI label that joins two labels take a plain hyphen. If your edit changed no word, it was the wrong edit.

### Escape hatches

- One line of TS/JS: `// eslint-disable-next-line local/no-slop-prose`
- One line of Markdown: `<!-- markdownlint-disable-next-line no-slop-prose -->`
- One line of C, CSS, shell, or config: put `slop-ok` in a comment on that line.
- A domain term that is never slop belongs in the allowlist, not behind a disable comment. `navigate`, `navigation`, `harness`, `unlock`, `underscore`, and `enhanced` (the HUD feature) are already there. Add yours to `SLOP_ALLOW` in `eslint.config.mjs`, or to `DEFAULT_ALLOW` in `scripts/lint/slop-patterns.mjs` when the word should pass for every tool. A lowercase entry matches any casing. An entry with a capital matches only that casing, so a word can pass as a setting name and still fail in a sentence.

Identifiers are never flagged: `ensureWasm`, `ensure-wasm`, and `ENSURE_OK` all pass, and so does anything inside a Markdown code fence or code span.

---

ESLint and a few project checks back these conventions up, so most slips get caught automatically. The real goal, though, is readable and well-organized code, not just a passing linter.
