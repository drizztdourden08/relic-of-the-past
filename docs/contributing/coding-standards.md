<!-- @layer docs @kind doc -->
# Coding Standards — ALttP Port

> Canonical coding-style reference for this repo. Both Claude Code (`/CLAUDE.md`)
> and GitHub Copilot (`.vscode/copilot-instructions.md`) point at this file so
> there is a single source of truth.

## Hard Rules (enforced by ESLint + a PostToolUse hook)

These are non-negotiable and **mechanically enforced** — see `eslint.config.mjs`
and `scripts/hooks/lint-changed.mjs` (lints every file on Write/Edit and feeds
violations straight back). Run the `coding-standards` skill's checklist after every
change.

1. **≤ 200 lines per file** (code lines). At the cap, split — no monolithic files, ever.
2. **Arrow functions only.** No `function foo() {}` declarations for components,
   hooks, or utilities.
3. **Exports grouped at the end** — never inline `export const/function/type`.
   (Barrels may re-export inline: `export { X } from './X'`.)
4. **`import type { … }`** for type-only imports.
5. **Design patterns are applied where they fit**, and **every plan states the
   pattern(s) used and the final output filetree** — use the `refactoring-guru` skill.

## Core Principles

1. **One thing per file.** Every file has a single responsibility — one component, one hook, one utility function, one type definition group, one constant set. Split aggressively.
2. **Destructure params on the first line** of any function/hook/component body.
3. **Exports at the end of the file** — never inline `export` on declarations.
4. **Group by concept in folders** — prefer deep logical structure over flat directories. Don't over-split: avoid a folder holding a single trivial file unless it will clearly grow.
5. **Small files, high reusability** — the hard cap is **200 lines**; treat ~150 as the point to start planning a split.

## Export Pattern

No inline `export` keyword on declarations. All exports grouped at the end of the file:

```ts
// ✅ Correct
const MyComponent = () => { ... };
type Props = { ... };

export { MyComponent };
export type { Props };

// ❌ Wrong
export const MyComponent = () => { ... };
export type Props = { ... };
```

Exception: barrel `index.ts` files use `export { X } from './X'` re-exports inline (they have no local declarations).

## Destructuring Rule

Every function, hook, component, or utility that receives a params/props/config object **destructures it on the first line**:

```ts
// ✅ Hook
const useProfileManagement = (params: ProfileManagementParams) => {
  const { showDialog, onProfileLoaded } = params;
  // ...
};

// ✅ Component
const ProfileCard = (props: ProfileCardProps) => {
  const { name, romFile, onSelect } = props;
  // ...
};

// ✅ Utility
const serializeToIni = (settings: GameSettings, options: SerializeOptions) => {
  const { msuPath, includeDefaults } = options;
  // ...
};

// ❌ Wrong — accessing props.name, params.showDialog throughout
```

## File Organization

**One thing per file.** This applies to everything — not just components:

| File type | Rule |
|-----------|------|
| Component | One component per `.tsx` file |
| Hook | One hook per `.ts` file |
| Utility function | One function per file (or tightly coupled set) |
| Type definitions | One logical group per `types.ts` |
| Constants | One logical group per `constants.ts` |
| Test | One test suite per `.test.ts` / `.spec.ts` |

```
// ✅ Correct — each file has one job
behavior/
├── useGameLifecycle.ts
├── useSaveOverlay.ts
└── useStartup.ts

utils/
├── serializeToIni.ts
├── mergeSettings.ts
└── formatDuration.ts

// ❌ Wrong — dumping multiple things in one file
helpers.ts  (contains serializeToIni + mergeSettings + formatDuration + 3 types)
```

**Folder grouping by concept:** Assemble related files under logical folders. Prefer deep structure over flat dumps:

```
// ✅ Correct — grouped by domain
shared/
├── game/         — game logic, seeds, events
├── input/        — input system, presets, registry
├── types/        — shared TypeScript types
└── asset-extraction/
    ├── rom/
    ├── graphics/
    ├── compression/
    └── music/

apps/desktop/src/
├── App/
│   ├── behavior/     — App-level hooks
│   ├── PageRouter.tsx
│   └── App.tsx
├── components/
│   ├── views/        — full-page views
│   └── composites/   — reusable compound components
├── lib/              — non-React logic (game bridge, IPC, etc.)
└── widgets/          — widget content components

// ❌ Wrong — flat folder with 30+ unrelated files
```

Additional rules:

- Path aliases: `@shared/*` → `shared/` folder.
- Barrel files (`index.ts`) only re-export — no logic.
- File name matches what it exports (e.g., `useGameLifecycle.ts`, `SlotCard.tsx`, `serializeToIni.ts`).
- If a utility folder has 3+ files, add an `index.ts` barrel.

## Component Architecture

Each non-trivial component lives in its own folder:

```
ComponentName/
├── ComponentName.tsx        — main component
├── ComponentName.css        — scoped styles
├── ComponentName.type.ts    — shared types/interfaces for this component
├── ComponentName.constants.ts — static data, configs, magic values
├── behavior/                — custom hooks (useXyz.ts), one per file
├── sub-components/          — child components only used here (recursive shape)
└── index.ts                 — barrel re-export
```

Root files are **name-prefixed** and the root holds ONLY those five — enforced
mechanically by the **structure-policy** (analyze adapter). Plus: **no raw HTML
outside `ui/design-system/primitives/`** (`local/no-raw-html`, ESLint) and
**no raw hex/named colors in component CSS** (`color-no-hex`, stylelint). All
three are warnings today (work toward error); `npm run report` lists them.

- `ComponentName.type.ts` imports React/shared types as needed, exports with `export type { ... }` at end.
- `index.ts` re-exports the main component and any types consumers need.
- Small components (single file, no hooks) don't need a folder — just `Component.tsx`.

## Hook Design

- **Zero-param hooks** when fully self-contained (e.g., `useGameLifecycle()`).
- **Positional args** for 2-4 simple dependencies (e.g., `useKeyboardShortcuts(nav, dialog, dismissDialog, activeProfile)`).
- **Params object** when there are callbacks or many config values.
- Return an object with named properties — never a tuple.

## App-Level Decomposition

```tsx
const App = () => {
  // 1. Declare all hooks (pure state + logic)
  const game = useGameLifecycle();
  const display = useDisplaySettings({ isGameRunning: game.isRunning });
  const profileMgmt = useProfileManagement({ ... });
  const nav = useAppNavigation({ ... });

  // 2. Side-effect hooks (no return value)
  useStartup(profileMgmt, nav);
  useIpcLogBridge();

  // 3. Minimal glue callbacks (only what can't live in a hook)
  const handleShowPicker = useCallback(...);

  // 4. Render — delegate page routing to PageRouter
  return (
    <div className="app">
      <TitleBar ... />
      <PageRouter nav={nav} game={game} ... />
      <WidgetManager ... />
      <Dialog ... />
    </div>
  );
};
```

## Naming Conventions

- **Hooks**: `useXyz` — camelCase, verb-noun (e.g., `useGameLifecycle`, `useSaveOverlay`).
- **Components**: PascalCase (e.g., `PageRouter`, `ProfilePicker`).
- **Types/Interfaces**: PascalCase, no `I` prefix (e.g., `ConfirmDialog`, `PageId`).
- **Utilities**: camelCase, verb-noun (e.g., `serializeToIni`, `mergeSettings`).
- **Constants**: camelCase for objects/arrays, UPPER_SNAKE for true constants only when disambiguation helps.
- **Event handlers**: `handleXyz` for internal, `onXyz` for props passed to children.
- **Boolean state**: `isXyz` or `showXyz` (e.g., `isRunning`, `showSpriteDebug`).

## TypeScript

- Both `type` and `interface` are valid — use whichever fits. They live together in their own `types.ts` file (one per component/module).
- Use `import type { ... }` for type-only imports.
- No `any` unless interfacing with untyped externals (cast with `as any` comment explaining why).
- Shared types live in `shared/types/` or component-local `types.ts`.

## React Patterns

- Functional components only (no class components).
- `useCallback` for handlers passed as props to prevent unnecessary re-renders.
- `useEffect` cleanup: always return cleanup functions for subscriptions/listeners.
- No inline object/array literals in JSX props (causes re-renders) — extract to `useMemo` or constants.

## Testing

- Test files: `*.test.ts` or `*.spec.ts` colocated or in `tests/` directory.
- Run only relevant tests, not the full suite.
- Use `vitest` for unit tests. For app/E2E verification, **prefer the built-in
  automation flags** (screenshots, state dumps) over Playwright — see
  @docs/contributing/testing.md.
- **Playwright is ephemeral:** don't accumulate specs. Write throwaway specs in
  `tests/scratch/` (gitignored), run, then delete. Only `tests/snapshot.spec.ts`
  is permanent. Never modify files marked "NEVER MODIFIED BY THE AI."
