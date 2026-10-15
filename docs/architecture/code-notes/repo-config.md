<!-- @layer docs @kind doc -->
# Code notes: repo config

Facts about the lint and tool settings at the repository root that the config files cannot say by themselves. Each heading names a config file by its path from the repository root.

## eslint.config.mjs

Every exception in this file says why. The factory refuses an `inlineStyle` or `glyphContent` entry without a `why`, so the reason sits beside the files it covers.

- `inlineStyle` lists the files that may set a `style` prop. Each entry holds values that exist only at run time: game positions and colours in the HUD, per frame sprite placement, live minimap and overlay coordinates, widths the user drags, and values a site API returns. No design token can hold those.
- `glyphContent` lists three data files whose content is glyphs: the annotation symbols the navigation overlay draws on the game canvas (no icon component can render there), the requirement icons of the navigation widget, and the symbols of the HUD presets.
- `consoleGlobs` lists the files that may call `console` on purpose. Command line tools and tests print to the terminal. The site APIs and the hub router write to the function logs. The main process debug and automation folders and the window hook forward renderer output. The game session dump, simulation and flood behavior files print the results of their start flags (`--dump-layers`, `--dump-nav`, `--sim-run`). The shader helpers and renderers report a missing WebGL context and compile errors, the enumeration writer reports a failed type regeneration, the saved view writer warns when a save fails, the cheat trace prints its frames, and the input runtime logs controller setup failures and haptic counters so a controller report can show them.
- `ignores` skips `tooling/sync-check` and `tooling/lint-changed`. Both tools exist to talk about the local assistant tooling: the commit check compares the repo with the config copies that live outside it, and the lint hook feeds results back to the assistant. They name those tools and their vendor by purpose, which the prose rules forbid everywhere else, and they carry notes for the people who run them. The other tools under `tooling/` are linted.
- The `ONE_SOURCE_FACADE` block forbids importing a record file or a collection loader from `packages/game-data/src` outside the facade in `src/data`. Everything reads records through the facade so one lookup answers for the whole app.

## stylelint.config.mjs

`exemptGlobs` holds one file, `apps/desktop/src/hud/hud.css`. The reason is written in the notes for that file in [apps/desktop/src/hud](apps-desktop-src-hud.md). Every other stylesheet under `src` is token only.

## standards.config.mjs

The `allow` list names words and identifiers the prose and name rules would flag but that are the app's own:

- `enhanced`, `EnhancedPauseView` and `EnhancedPauseViewProps` name the Enhanced HUD and pause menu feature.
- `Modern` and the `Modern*` names (`ModernSlot`, `ModernBindings`, `ModernScheme`, `ModernControlsTab`) name the Modern control scheme.
- `AI`, `offscreenAI` and `PauseOffscreenAI` name the off screen enemy behavior setting. `offscreenAI` is a key that saved profiles already hold, so it cannot be renamed.
