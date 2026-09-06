<!-- @layer tests @kind doc -->
<!-- Maintained registry. See docs/contributing/testing.md. Update the matching
     row whenever a .keep.test.ts / .keep.spec.ts file is added, removed, or its
     target area changes. Verdicts: covered / partial / none. Recount the summary
     below whenever a row's verdict changes. -->

| Verdict | Areas | % |
|---|---|---|
| covered | 46 | 51% |
| partial | 11 | 12% |
| none | 34 | 37% |

91 areas counted (one row per table row above, not weighted by file count). 2 rows excluded from the count: presentational primitives (n/a, not a real gap) and shadow-casting (unclear, needs a follow-up pass, covered in the Electron section).

## UI views (`apps/web/src/ui/domains/app/views/`)

| Area | Tests | Verdict |
|---|---|---|
| DataInspector (record browser/editor + recommendation review) | tests/data-inspector/*.keep.test.ts (18 files) | covered |
| DataManager (ROM/profile/save/language/sprite hub) | none | none |
| SearchPalette (catalog build + ranking) | tests/search/catalog.coverage.keep.test.ts, tests/search/match.keep.test.ts | partial. Hooks (useSearchPalette/useSearchResults/run-target) untested |
| TrackerView (item/check tracker overlay) | none | none |
| ProfileHub | none (only touched as a constant via search catalog test) | none |
| GameLayer + shadow-editor-overlay | none directly | partial. See the shadow-casting row below |
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
| NavigationWidget's own components (minimap, connections panel, canvas) | none | none. The algorithms are covered above, the widget UI is not |
| LiveDataInspector use-current-records | tests/widgets/live-data-inspector-records.keep.test.ts | partial. use-detection-pass, use-chest/screen/sprite-observations, use-live-context and granted-items-store are untested |
| Screen-editor draft builder | tests/widgets/screen-record-draft.keep.test.ts | covered |
| SimulatorWidget orchestration (run-results, runner-loop, useDatasetSuggestions, useLogWindow, useSimulatorRun, useStopAtChecks) | none directly (the engine itself is covered in the simulation row) | none |
| ChecksWidget / DebugWidget / InventoryWidget / LogsWidget / CheatsWidget | none | none |
| **Widget composite (drag/resize/dock chrome shared by all 7 widgets)** | none | **none. The single biggest gap in the UI layer** |

## Design system (`apps/web/src/ui/design-system/`)

| Area | Tests | Verdict |
|---|---|---|
| DataTable + data/table + data/schema | 17 files under tests/design-system | covered. The deepest-tested subsystem in the app |
| RecordEditor (all field-shape variants) | 10 files under tests/design-system | covered |
| CompactRecordView | compact-record-view-render, compact-record-view-identity | covered |
| field-kits (array/boolean/enum/id-ref/number/object/string/structured/union) | 6 files under tests/design-system | covered |
| FilterBar + data/filter | 6 files under tests/design-system | covered |
| data/view-state (durable load/save, race protection) | 4 files under tests/design-system | covered |
| ScrollArea sync, Portal anchor-tracking, SegmentedControl, PositionInput, TagInput, CodeBlock, CreateRecordDialog | 1 file each under tests/design-system | covered |
| DeleteGuardDialog | delete-guard-route (via RecordEditor) | partial. The dialog component itself is untested |
| DropdownMenu, Select, TagPicker, NavRail | none | none |
| Dialog/DialogShell/Drawer/FullScreenLayer/ListItemRow/MasterDetailLayout/Overlay/SettingsSection/SettingsShell/SideNav/WindowHeader/WizardDialogShell | none | none (mostly presentational shells) |
| Toggle/Toast/DropZone/NumberInput/RangeInput/Slider/Stepper/ToggleGroup/Tooltip/Checkbox/RadioGroup/Badge/StatusBadge/ProgressBar/ProgressRing/Thumbnail/TabBar/Svg | none | n/a. Pure presentational primitives, not counted as a gap |

## Electron main process / IPC (`apps/desktop/electron/`)

| Area | Tests | Verdict |
|---|---|---|
| screen-editor writers (actor/check/dungeon/item/item-group/tag/enumeration/geography, id-allocator) | tests/game/data/*.keep.test.ts + tests/electron | covered |
| recommendations file store (write queue) | tests/electron/recommendation-files.keep.test.ts | covered |
| review layer (main-process read/write) | tests/electron/review-files.keep.test.ts | covered |
| **saves/profiles/roms, the real Electron store (`electron/{saves,profiles,roms}/store.ts`)** | none. Only the separate `shared/storage/*` web-target abstraction is tested | **none. A coverage illusion: the code path the real desktop app runs is untested; only a parallel, non-shared implementation is** |
| SDL3 controller hardware layer (sdl3-source, device-lister, haptic-pattern-player, calibration-store) | none | none (hardware-dependent; calibration/profile persistence could still be tested portably and isn't) |
| Android SDL3 controller plugin (`controller_sdl3_jni.c`, `Sdl3Bridge`, `Sdl3InputRouter`, capacitor `controller-sdl3-*`) | none | none (device-dependent: needs a physical pad on a phone, and the JNI's JSON event shape is the only portable seam. The store's subscribe-before-start ordering is testable without hardware and isn't covered) |
| Portable input logic (`@shared/input`, pause-manager, profile-devices, polling-engine) | tests/input/*.keep.test.ts (4 files) | covered. Dropped the Gamepad-API dual-bus dispatch case (haptic-dispatch.keep.test.ts) when that transport was removed; vibration-shaping.keep.test.ts now exercises the family layer's shapeVibration instead of BaseController |
| MSU-1 audio IPC handlers | none directly (business logic tested via shared/storage/msu.ts) | partial. The same coverage-illusion pattern as saves/profiles/roms |
| Window management (aspect-ratio, create-window, window-state, startup-config, send-to-back, text-interaction) | tests/game/aspect-ratio.keep.test.ts (aspect-ratio only) | partial |
| Display (mode-switch, refresh-rate) | none | none |
| Diagnostics (collect-displays/gpu/host) | none | none |
| dialogs, github, languages ipc-handlers, sessions, sprites ipc-handlers, storage file-handlers, ui-views ipc-handlers, wasm ipc-handlers, connections, protocol, instance-config/identity, updater | none directly | none/partial |
| Automation-launch predicate | tests/parallel/automation-launch.keep.test.ts | covered |
| Shadow-casting (electron store + shared/web split) | not confidently traced this pass | **flagged. Needs a dedicated follow-up pass** |

## Shared game logic (`shared/game/`)

| Area | Tests | Verdict |
|---|---|---|
| Data facade/registry | tests/game/data + tests/data-inspector | covered |
| Connection-points model (screenId/toConnectionId/canExit pairing) | tests/game/data/connection-pairing.keep.test.ts | covered. 2 of 6 invariants are marked `test.todo` for known pre-existing data gaps (see file header) |
| Enumeration system | tests/game/data/enumeration-*, tests/design-system/enum-* | covered |
| Tags/taxonomy | tests/game/data/check-content-tags.keep.test.ts | partial. connection-tags and item-categories are untested directly |
| logic/resolver + logic/eval | tests/game/resolver.keep.test.ts | covered |
| logic/queries for detection, palace-fallback, dungeon-group/values, item-duplicates | tests/game/recommendations, tests/game/navigation, tests/simulation | covered |
| logic/queries for bundles, game-id, item-sprites, sprite-manifest, screen-tags | tests/storage/sprite-set-freshness.keep.test.ts (URL revision) + tests/randomizer/pool-listing-sprites.keep.test.ts (every item's art is a file the extraction writes) | partial. bundles, game-id, sprite-manifest, screen-tags untested |
| Navigation engine (flood-fill, strategies, BFS, cliffs, void-tiles) | tests/game/navigation (8 files) + tests/simulation + tests/e2e/flood-parity.keep.spec.ts | covered |
| Recommendations engine + detectors + diff/reconcile/registry | tests/game/recommendations (13 files) | covered |
| Review types | tests/electron/review-files, tests/data-inspector/review-store | covered |
| Simulation engine | tests/simulation (20 files) | covered. The largest single suite in the repo |
| simulation/port.ts (WASM↔simulation bridge) | none directly (consumers are tested) | partial |

## Randomizer (`shared/randomizer/` + `apps/web/src/lib/game/randomizer-client/`)

| Area | Tests | Verdict |
|---|---|---|
| Placement -> physical plan coverage (every generated location is planned or reported, never silently dropped; dungeon prizes stay vanilla; shop slots plan as shop overrides at every depth, in all four shuffle modes, across the nine shelf shops, the potion hut and the bomb counter) | tests/randomizer/plan-covers-placement.keep.test.ts | covered |
| Creation-option wiring: every unlocked catalog row produces a value through `randomizerChoiceOverrides`, so a newly unlocked option cannot reach the panel without reaching the snapshot and the generator too; plus each row listed once (rows owned by a block stay out of the plain list) and the whole shop scope (mode, per-slot ticks, count and depth) really reaching the fill, with the count never exceeding the ticked set | tests/randomizer/option-wiring.keep.test.ts | covered |
| Option catalog (`shared/randomizer/ap-world/options.data.ts`): field set, defaults, range bounds, choice values, and the `replacedBy` invariant that a superseded row names its successor and is always locked | none | none. The test that covered this diffed the catalog against a vendored copy of the upstream option source, which is no longer kept in the repo. Recovering it needs a check written against the catalog itself |
| Progressive tier tick sets (`shared/randomizer/ap-world/progressive/`): representative sets rolled over many seeds each, a returned placement being the proof it plays, and the load-bearing rungs pinned as refusals the generator names up front rather than unfinishable seeds | tests/randomizer/progressive-tier-generation.keep.test.ts | covered |
| Tier-tick consequences: the lines the Items tab shows for a tick set stand in lockstep with the switches the derivation actually masks on, so the wording cannot drift from what the seed does | tests/randomizer/progressive-tick-consequences.keep.test.ts | covered |
| Progressive tier masks in the built wasm (progressive_grants.c): a family's mask armed the way a session arms it, then the grant resolver asserted to hand over the lowest rung still present at or above the tier held, with an unarmed family walking the full ladder, so the C mask and the TS ladder are held to the same reading and neither can drift alone | tests/randomizer/progressive-tier-probe.keep.test.ts | covered. Skips without the wasm, asset blob or vault fixture |
| Shops tab model (`ShopSlotsBlock/behavior/`): the count control and the total sentence both read the OPENED set, so custom mode shows the ticked count, unticking lowers both, and neither can climb as the ticked ceiling falls; the count is drawn as a slider only in the modes that take a number out of the ticked set and as a read-out in the ones the ticks alone decide, so no bar sits full while its number falls; sequential clamps to the ticked set; vanilla says nothing is shuffled; the cards split by world, the world words dropped from their titles and every title left unique; and a brand-new profile's scope ticks every shelf and bomb slot while leaving the potion hut's three cauldrons unticked, through the frozen snapshot and back | tests/randomizer/shop-slots-panel.keep.test.ts | covered |
| Hook-owned save-byte registry (core/game-hooks/save_bytes.h): no claim overlaps, the whole allocation stays inside 0xF406-0xF4FD, and the TS mirror `apps/web/src/lib/game/save-file/hook-save-bytes.ts` matches the C header | tests/randomizer/hook-save-bytes.keep.test.ts | covered |
| Potion/price dependency rule (`shared/randomizer/ap-world/potion-price/`): a hut cauldron given to the shuffle takes its potion off the bottle-price list, enumerated over every shuffle mode x cauldron subset x price choice: the row masked, the frozen snapshot carrying the mask, the roll refusing the content even from a hand-edited snapshot, fairies and bees never blocked, and a potion price gated on reaching the seller; plus each cauldron asserted on its own, blocking only its own content and greying only that one price row (`ShopPricesBlock/behavior/bottle-content-rows`), with the row given straight back when that cauldron is unticked | tests/randomizer/potion-price-rule.keep.test.ts | covered |
| Capacity/pond dependency rule (`shared/randomizer/ap-world/capacity-pond/`): the master switch's off state, and every reachable pairing of pond mode x family mode x the control that moved, proving no configuration leaves the explosives or projectiles upgrades with no source at all: settled, stable, and closed under every move the two tabs still offer, through the real snapshot writer | tests/randomizer/capacity-pond-rule.keep.test.ts | covered |
| Wishing-pond model (`shared/randomizer/ap-world/pond/`): the rupee decomposition and its volleys, the four modes' throw/price/prize schedules, the snapshot adapter and its fallbacks, the worst-case wallet reading of a prize, and the pond's own three receipt lines | tests/randomizer/pond-model.keep.test.ts | covered |
| Wishing-pond generation: every mode beatable over many seeds, prize slots really carrying pool items, the wallet rule gating them, and a legacy-default world byte-identical to the pre-option generator | tests/randomizer/pond-generation.keep.test.ts | covered |
| Wishing-pond core seams (pond_plan.c, pond_toss_draw.c) in the built wasm, gate on and gate off: price/amount/bank/wait, the throw counter's once-each anti-farm property, the gamble refund, the gem decomposition, and the host lines replacing the vanilla wording | tests/randomizer/pond-core-probe.keep.test.ts | covered. Skips without the wasm, asset blob or vault fixture |

## Asset extraction (`shared/asset-extraction/`) is the largest raw gap by file count

| Area | Tests | Verdict |
|---|---|---|
| text/dialogue-decoder + parse-dialogue-text | tests/asset-extraction/dialogue-text-roundtrip.keep.test.ts | covered |
| rom/* (reader, rom-loader, load-rom-file, snes-address) | none | none |
| compression/* (BRR codec, LZ decompress) | none | none |
| graphics/* (bitplane-decoder, palette, png-writer) | none | none |
| extraction/* (chest-pit, dungeon, entrance, overworld, room extractors/decoder) | none | none |
| item-sprites/* (drop/hud/receipt decoders, extract-items) | none | none |
| item-sprites extraction stamp + extracted-set freshness (`extraction-stamp.ts`, `shared/storage/sprites.ts` isStale/extractedFileNames) | tests/storage/sprite-set-freshness.keep.test.ts | covered: the stale/missing/current decision and the rewritten-set URL; the extraction itself is still untested |
| music/* (compile/decode/extract/serialize) | none | none |
| compile-*.ts orchestrators + asset-builder.ts | none | none |

**~70 source files in this zone, 1 tested. Biggest concrete coverage hole in the repo.**

## Feature gating (`shared/features/`)

| Area | Tests | Verdict |
|---|---|---|
| resolve-features.ts | tests/features/resolve-features.keep.test.ts | covered |
| bundle-fixes/bundle-flags C↔TS parity | tests/features/bundle-flags-parity.keep.test.ts | covered |
| all-off/vanilla preset | tests/features/all-off-vanilla.keep.test.ts | covered |
| Vanilla Safe lock (resolveGates completeness across the whole registry) | tests/features/vanilla-safe-lock.keep.test.ts | covered |
| feature-registry.ts / feature.type.ts (own shape), including the `devNavigationData` / `trackerEnabled` host-query gates | none directly (exercised transitively, because vanilla-safe-lock.keep.test.ts and resolve-features.keep.test.ts iterate the whole `FEATURES` array, so new entries are covered automatically) | partial |

## WASM / game-hooks bridge (`core/game-hooks/` C surface + JS consumers)

| Area | Tests | Verdict |
|---|---|---|
| ui_state.c → parseGameUIBuffer (JS side) | tests/game/ui-bridge-parser.keep.test.ts, tests/hud/hud-visibility.keep.test.ts | covered on the JS side only. No C-level harness exists anywhere |
| state_queries*.c → `apps/web/src/lib/game/bridge/*` (combat-tables, nav-tables, player-state, progress, render, room-doors/grids/layout, sim-queries, sprites-blockers, ui-state) | none directly (higher-level consumers are tested) | none |
| **GameHook_\* event surface (cheats, check_triggers, item_overrides, haptic_events, transition_events, sim_triggers, sim_queries)** | none. Neither the C symbols nor their 2 JS call sites (transition-events.ts, simulator/interactables.ts) are referenced by any test | **none. Untested end to end** |
| player_sprite.c, num_util.h, wasm_buf.h | none | none (lower risk, pure utilities) |

## Global stores (`apps/web/src/stores/`)

| Area | Tests | Verdict |
|---|---|---|
| data-view-store | covered (via tests/data-inspector) | covered |
| boot-progress, delivery-queue, exclusive-insets, game-ui, hud-settings, location-notification, navigation-overlay, refresh-rate, search, shadow-editor, simulator, sprite-availability (13 stores) | none directly | none |
| Sprite-set activation (which ROM the shared base points at, `lib/sprites/sprite-rom.ts`) | tests/randomizer/pool-listing-sprites.keep.test.ts | covered: the no-active-profile fallback the creation form depends on |

## Not counted as app-feature coverage

`tests/parallel/*` (automation-launch, link-deps, verdict) test the `scripts/parallel/*.mjs` worktree/agent-orchestration CLI, which is dev tooling and not an app feature. Kept for completeness, excluded from the verdicts above.
