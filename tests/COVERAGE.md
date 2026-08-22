<!-- @layer tests @kind doc -->
<!-- Maintained registry — see docs/contributing/testing.md. Update the matching
     row whenever a .keep.test.ts / .keep.spec.ts file is added, removed, or its
     target area changes. Verdicts: covered / partial / none. Recount the summary
     below whenever a row's verdict changes. -->

| Verdict | Areas | % |
|---|---|---|
| covered | 30 | 41% |
| partial | 10 | 14% |
| none | 33 | 45% |

73 areas counted (one row per table row above, not weighted by file count). 2 rows excluded from the count: presentational primitives (n/a, not a real gap) and shadow-casting (unclear, needs a follow-up pass — see Electron section).

## UI views (`apps/web/src/ui/domains/app/views/`)

| Area | Tests | Verdict |
|---|---|---|
| DataInspector (record browser/editor + recommendation review) | tests/data-inspector/*.keep.test.ts (18 files) | covered |
| DataManager (ROM/profile/save/language/sprite hub) | none | none |
| SearchPalette (catalog build + ranking) | tests/search/catalog.coverage.keep.test.ts, tests/search/match.keep.test.ts | partial — hooks (useSearchPalette/useSearchResults/run-target) untested |
| TrackerView (item/check tracker overlay) | none | none |
| ProfileHub | none (only touched as a constant via search catalog test) | none |
| GameLayer + shadow-editor-overlay | none directly | partial — see shadow-casting row below |
| SaveStateOverlay | tests/e2e/state-*.keep.spec.ts (baseline parity only) | partial |
| BootProgressBar / boot-progress-store | none | none |
| MobileChrome | none | none |
| BugReport (+ electron github report-issue/ipc-handlers) | none | none |
| About / SpriteDebug / DesignGallery / LogOverlay | none | none |
| AppMain / GameOverlay / TitleBar / ProfilePage | none | none |

## HUD (`apps/web/src/ui/domains/app/hud/`)

| Area | Tests | Verdict |
|---|---|---|
| HUD mode/visibility derivation (parseGameUIBuffer) | tests/hud/hud-visibility.keep.test.ts, tests/game/ui-bridge-parser.keep.test.ts | covered |
| HudLife/HudMagicMeter/HudCount/HudCurrentItem, Pause* panels | none | none |
| DeliveryQueueIndicator / LocationNotification + their stores | none | none |

## Widgets (`apps/web/src/ui/domains/widgets/`)

| Area | Tests | Verdict |
|---|---|---|
| Navigation core algorithms (`shared/game/navigation`) | tests/game/navigation/*.keep.test.ts (8 files) | covered |
| NavigationWidget's own components (minimap, connections panel, canvas) | none | none — algorithms covered above, widget UI is not |
| LiveDataInspector — use-current-records | tests/widgets/live-data-inspector-records.keep.test.ts | partial — use-detection-pass, use-chest/screen/sprite-observations, use-live-context, granted-items-store untested |
| Screen-editor draft builder | tests/widgets/screen-record-draft.keep.test.ts | covered |
| SimulatorWidget orchestration (run-results, runner-loop, useDatasetSuggestions, useLogWindow, useSimulatorRun, useStopAtChecks) | none directly (engine itself is covered — see simulation row) | none |
| ChecksWidget / DebugWidget / InventoryWidget / LogsWidget / CheatsWidget | none | none |
| **Widget composite (drag/resize/dock chrome shared by all 7 widgets)** | none | **none — single highest-leverage gap in the UI layer** |

## Design system (`apps/web/src/ui/design-system/`)

| Area | Tests | Verdict |
|---|---|---|
| DataTable + data/table + data/schema | 17 files under tests/design-system | covered — deepest-tested subsystem in the app |
| RecordEditor (all field-shape variants) | 10 files under tests/design-system | covered |
| CompactRecordView | compact-record-view-render, compact-record-view-identity | covered |
| field-kits (array/boolean/enum/id-ref/number/object/string/structured/union) | 6 files under tests/design-system | covered |
| FilterBar + data/filter | 6 files under tests/design-system | covered |
| data/view-state (durable load/save, race protection) | 4 files under tests/design-system | covered |
| ScrollArea sync, Portal anchor-tracking, SegmentedControl, PositionInput, TagInput, CodeBlock, CreateRecordDialog | 1 file each under tests/design-system | covered |
| DeleteGuardDialog | delete-guard-route (via RecordEditor) | partial — dialog component itself untested |
| DropdownMenu, Select, TagPicker, NavRail | none | none |
| Dialog/DialogShell/Drawer/FullScreenLayer/ListItemRow/MasterDetailLayout/Overlay/SettingsSection/SettingsShell/SideNav/WindowHeader/WizardDialogShell | none | none (mostly presentational shells) |
| Toggle/Toast/DropZone/NumberInput/RangeInput/Slider/Stepper/ToggleGroup/Tooltip/Checkbox/RadioGroup/Badge/StatusBadge/ProgressBar/ProgressRing/Thumbnail/TabBar/Svg | none | n/a — pure presentational primitives, not counted as a gap |

## Electron main process / IPC (`apps/desktop/electron/`)

| Area | Tests | Verdict |
|---|---|---|
| screen-editor writers (actor/check/dungeon/item/item-group/tag/enumeration/geography, id-allocator) | tests/game/data/*.keep.test.ts + tests/electron | covered |
| recommendations file store (write queue) | tests/electron/recommendation-files.keep.test.ts | covered |
| review layer (main-process read/write) | tests/electron/review-files.keep.test.ts | covered |
| **saves/profiles/roms — real Electron store (`electron/{saves,profiles,roms}/store.ts`)** | none — only the separate `shared/storage/*` web-target abstraction is tested | **none — coverage illusion: the code path the real desktop app runs is untested; only a parallel, non-shared implementation is** |
| SDL3 controller hardware layer (sdl3-source, device-lister, haptic-pattern-player, calibration-store) | none | none (hardware-dependent; calibration/profile persistence could still be tested portably and isn't) |
| Android SDL3 controller plugin (`controller_sdl3_jni.c`, `Sdl3Bridge`, `Sdl3InputRouter`, capacitor `controller-sdl3-*`) | none | none (device-dependent: needs a physical pad on a phone, and the JNI's JSON event shape is the only portable seam — the store's subscribe-before-start ordering is testable without hardware and isn't covered) |
| Portable input logic (`@shared/input`, pause-manager, profile-devices, polling-engine) | tests/input/*.keep.test.ts (4 files) | covered — dropped the Gamepad-API dual-bus dispatch case (haptic-dispatch.keep.test.ts) when that transport was removed; vibration-shaping.keep.test.ts now exercises the family layer's shapeVibration instead of BaseController |
| MSU-1 audio IPC handlers | none directly (business logic tested via shared/storage/msu.ts) | partial — same coverage-illusion pattern as saves/profiles/roms |
| Window management (aspect-ratio, create-window, window-state, startup-config, send-to-back, text-interaction) | tests/game/aspect-ratio.keep.test.ts (aspect-ratio only) | partial |
| Display (mode-switch, refresh-rate) | none | none |
| Diagnostics (collect-displays/gpu/host) | none | none |
| dialogs, github, languages ipc-handlers, sessions, sprites ipc-handlers, storage file-handlers, ui-views ipc-handlers, wasm ipc-handlers, connections, protocol, instance-config/identity, updater | none directly | none/partial |
| Automation-launch predicate | tests/parallel/automation-launch.keep.test.ts | covered |
| Shadow-casting (electron store + shared/web split) | not confidently traced this pass | **flagged — needs a dedicated follow-up pass** |

## Shared game logic (`shared/game/`)

| Area | Tests | Verdict |
|---|---|---|
| Data facade/registry | tests/game/data + tests/data-inspector | covered |
| Connection-points model (screenId/toConnectionId/canExit pairing) | tests/game/data/connection-pairing.keep.test.ts | covered — 2 of 6 invariants marked `test.todo` for known pre-existing data gaps (see file header) |
| Enumeration system | tests/game/data/enumeration-*, tests/design-system/enum-* | covered |
| Tags/taxonomy | tests/game/data/check-content-tags.keep.test.ts | partial — connection-tags, item-categories untested directly |
| logic/resolver + logic/eval | tests/game/resolver.keep.test.ts | covered |
| logic/queries — detection, palace-fallback, dungeon-group/values, item-duplicates | tests/game/recommendations, tests/game/navigation, tests/simulation | covered |
| logic/queries — bundles, game-id, item-sprites, sprite-manifest, screen-tags | none | none |
| Navigation engine (flood-fill, strategies, BFS, cliffs, void-tiles) | tests/game/navigation (8 files) + tests/simulation + tests/e2e/flood-parity.keep.spec.ts | covered |
| Recommendations engine + detectors + diff/reconcile/registry | tests/game/recommendations (13 files) | covered |
| Review types | tests/electron/review-files, tests/data-inspector/review-store | covered |
| Simulation engine | tests/simulation (20 files) | covered — largest single suite in the repo |
| simulation/port.ts (WASM↔simulation bridge) | none directly (consumers are tested) | partial |

## Asset extraction (`shared/asset-extraction/`) — largest raw gap by file count

| Area | Tests | Verdict |
|---|---|---|
| text/dialogue-decoder + parse-dialogue-text | tests/asset-extraction/dialogue-text-roundtrip.keep.test.ts | covered |
| rom/* (reader, rom-loader, load-rom-file, snes-address) | none | none |
| compression/* (BRR codec, LZ decompress) | none | none |
| graphics/* (bitplane-decoder, palette, png-writer) | none | none |
| extraction/* (chest-pit, dungeon, entrance, overworld, room extractors/decoder) | none | none |
| item-sprites/* (drop/hud/receipt decoders, extract-items) | none | none |
| music/* (compile/decode/extract/serialize) | none | none |
| compile-*.ts orchestrators + asset-builder.ts | tests/asset-extraction/alttp-asset-set.keep.test.ts | partial |
| sources/gba-alttp/* (second-cartridge extraction) | tests/asset-extraction/gba-alttp-supplement.keep.test.ts | partial |

**~70 source files in this zone, 3 tested. Still the biggest concrete coverage hole in the repo.**

The two rows above cover the multi-source aggregator (the base stays byte-identical with or
without a supplement) and the second-cartridge extractor. Neither exercises the base-only
compile path itself, which remains untested.

## Feature gating (`shared/features/`)

| Area | Tests | Verdict |
|---|---|---|
| resolve-features.ts | tests/features/resolve-features.keep.test.ts | covered |
| bundle-fixes/bundle-flags C↔TS parity | tests/features/bundle-flags-parity.keep.test.ts | covered |
| all-off/vanilla preset | tests/features/all-off-vanilla.keep.test.ts | covered |
| Vanilla Safe lock (resolveGates completeness across the whole registry) | tests/features/vanilla-safe-lock.keep.test.ts | covered |
| feature-registry.ts / feature.type.ts (own shape), including the `devNavigationData` / `trackerEnabled` host-query gates | none directly (exercised transitively — vanilla-safe-lock.keep.test.ts and resolve-features.keep.test.ts iterate the whole `FEATURES` array, so new entries are covered automatically) | partial |

## WASM / game-hooks bridge (`core/game-hooks/` C surface + JS consumers)

| Area | Tests | Verdict |
|---|---|---|
| ui_state.c → parseGameUIBuffer (JS side) | tests/game/ui-bridge-parser.keep.test.ts, tests/hud/hud-visibility.keep.test.ts | covered on the JS side only — no C-level harness exists anywhere |
| state_queries*.c → `apps/web/src/lib/game/bridge/*` (combat-tables, nav-tables, player-state, progress, render, room-doors/grids/layout, sim-queries, sprites-blockers, ui-state) | none directly (higher-level consumers are tested) | none |
| **GameHook_\* event surface (cheats, check_triggers, item_overrides, haptic_events, transition_events, sim_triggers, sim_queries)** | none — neither C symbols nor their 2 JS call sites (transition-events.ts, simulator/interactables.ts) are referenced by any test | **none — untested end to end** |
| player_sprite.c, num_util.h, wasm_buf.h | none | none (lower risk, pure utilities) |

## Global stores (`apps/web/src/stores/`)

| Area | Tests | Verdict |
|---|---|---|
| data-view-store | covered (via tests/data-inspector) | covered |
| boot-progress, delivery-queue, exclusive-insets, game-ui, hud-settings, location-notification, navigation-overlay, refresh-rate, search, shadow-editor, simulator, sprite-availability (13 stores) | none directly | none |

## Not counted as app-feature coverage

`tests/parallel/*` (automation-launch, link-deps, verdict) test the `scripts/parallel/*.mjs` worktree/agent-orchestration CLI — dev tooling, not an app feature. Kept for completeness, excluded from the verdicts above.
