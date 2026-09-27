<!-- @layer tests @kind doc -->
<!-- Maintained registry. See docs/contributing/testing.md. Update the matching
     row whenever a .keep.test.ts / .keep.spec.ts file is added, removed, or its
     target area changes. Verdicts: covered / partial / none. Recount the summary
     below whenever a row's verdict changes. -->

| Verdict | Areas | % |
|---|---|---|
| covered | 53 | 54% |
| partial | 11 | 11% |
| none | 34 | 35% |

98 areas counted (one row per table row above, not weighted by file count). 2 rows excluded from the count: presentational primitives (n/a, not a real gap) and shadow-casting (unclear, needs a follow-up pass, covered in the Electron section).

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
| Crossings facade (`apps/web/src/lib/game/crossings/`), the one producer of every way on and off a screen, plus `usable-crossings.ts` and `crossing-sections.ts` | none directly. The seven tests/e2e/state-*.keep.spec.ts baselines pin the reachable counts the crossings feed, and tests/simulation/screen-panel.keep.test.ts pins the annotation grouping now that ways out have left it | partial. The flood numbers downstream of it are pinned; the per-source collectors, placement rule and availability marking have no unit test |
| "On this screen" panel grouping, which no longer carries a ways-out group | tests/simulation/screen-panel.keep.test.ts | covered |
| LiveDataInspector use-current-records | tests/widgets/live-data-inspector-records.keep.test.ts | partial. use-detection-pass, use-chest/screen/sprite-observations, use-live-context and granted-items-store are untested |
| Screen-editor draft builder, and `screenBlockers` (shared/game/logic/queries/screen-validity.ts) as the one owner of "is this screen real enough to store", which the builder and the create validator both delegate to | tests/widgets/screen-record-draft.keep.test.ts | covered for the builder. The tier-agreement and file-home rules inside `screenBlockers` are reached through it, not asserted directly |
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
| DropdownMenu, Select, TagPicker, SectionNav | none | none |
| Dialog/DialogShell/Drawer/FullScreenLayer/ListItemRow/MasterDetailLayout/Overlay/SettingsSection/SettingsShell/SideNav/WindowHeader/WizardDialogShell | none | none (mostly presentational shells) |
| Toggle/Toast/DropZone/NumberInput/RangeInput/Slider/Stepper/ToggleGroup/Tooltip/Checkbox/RadioGroup/Badge/StatusBadge/ProgressBar/ProgressRing/Thumbnail/TabBar/Svg | none | n/a. Pure presentational primitives, not counted as a gap |

## Electron main process / IPC (`apps/desktop/electron/`)

| Area | Tests | Verdict |
|---|---|---|
| screen-editor writers (actor/check/dungeon/item/item-group/tag/enumeration/geography, id-allocator) | tests/game/data/*.keep.test.ts + tests/electron | covered. Includes the review-mark round trip |
| recommendations file store (write queue) | tests/electron/recommendation-files.keep.test.ts | covered |
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
| Dataset integrity, exhaustively: every id one record points at another with resolves to a record of that kind and is spelled with its prefix, every id is unique inside its own collection, a screen agrees with its area, its location's area and its region about the world, and every event bit sits inside the ledger the core declares with no two event rows on one bit | tests/game/data/dataset-integrity.keep.test.ts (record-references.ts) | covered. Replaces the sampling suite that took one record per case. Two declared exemptions, both named in the file: `area-000` / `location-000`, the two "no place assigned" ids the menu pseudo-screen carries, and bit 97, read by both the floodgate the rules place an item at and the Events row for the same moment |
| Record tree layout: every record file at the path its collection, world, area or dungeon and floor dictate, no file named by a size split, one shape of path per collection | tests/game/data/tree-layout.keep.test.ts | covered |
| Record write path: where a new record is filed, and that every committed record already sits there (shared/game/data/record-file-targets.ts) | tests/game/data/record-file-targets.keep.test.ts | covered |
| Generated mirrors: every file written from the records or from the event ledger's header equals a fresh `scripts/generate-from-records.mjs --check` run, byte for byte. Today that is the event bit map, the three tag taxonomies, and the two marked C tables (`kBossRoomByPalace`, `kVanillaPrizeItem`) | tests/game/data/generated-mirrors.keep.test.ts (scripts/generate-from-records.mjs) | partial. The four targets that hold records today are covered; `events/event_areas.h`, `kSubstitutionBits`, the three inventory layouts and the ten native tables are still hand copies, because no record holds what they state (see the script's header) |
| Regions, the third partition: one region per reference taxonomy row at a dense run of ids, the area table's 15 heads and 11 boxes on the regions that stand for them, a dungeon named on every wing and on nothing else, every screen's `regionId` pointing at a region of its own world and, for a dungeon room, at a wing of its own dungeon, every screen sitting at a location filed under its own area, and every cave region's screens standing in one area | tests/game/data/regions.keep.test.ts | partial. 32 dungeon rooms and 16 wings are still unpaired, each named in the file's two exception lists for the inspector pass; the world faults are gone |
| Regions to screens, the reachable set the tracker reads (shared/game/logic/regions/reachable-screens.ts) | tests/game/one-rules-path.keep.test.ts | covered |
| Native ids on the records, against the cartridge: a screen's entranceId lands in that screen's room and no mouth is claimed by more screens than the ROM has slots for it, every room a door opens into has a screen carrying one of its doors and no room carries more doors than the cartridge reaches it by, a dungeon screen's entrance belongs to its palace, a connection's entranceId sits on a mouth of its own overworld area, an exitId names the exit that leaves that room, a stairIndex names the room-header slot that travels there, a bossRoomId is a room the cartridge tags as a boss room and matches the C hand table it will generate, every chest check resolves in the native chest table, every key requirement on a dungeon crossing is backed by a lock the room's own door list declares, every area-head event sits on an area that is its own head, and every mouth of the 129 slots is carried by a screen apart from two fall holes whose landing room a door already holds | tests/game/data/rom-facts.keep.test.ts (shared/randomizer/audit/rom-native-tables.ts, rom-room-doors.ts, rom-census.ts) | covered. Every room a door opens into now holds a screen; skips without a US ROM, so a clone with none stays green |
| The regression net: every check's status, the inventory and the reachable screens, for every save and seed of the corpus, compared against a blessed run | tests/regression/run-snapshot.keep.test.ts, tests/regression/run-compare.keep.test.ts (corpus.ts, expected-changes.data.ts) | covered. A step declares the rows it may move in expected-changes.data.ts; a refactor declares none |
| Connection-points model (screenId/toConnectionId/canExit pairing) | tests/game/data/connection-pairing.keep.test.ts | covered. 2 of 6 invariants are marked `test.todo` for known pre-existing data gaps (see file header) |
| Enumeration system | tests/game/data/enumeration-*, tests/design-system/enum-* | covered |
| Tags/taxonomy | tests/game/data/check-content-tags.keep.test.ts | partial. connection-tags and item-categories are untested directly |
| One rules path, on this side of the seam: the engine's regions named as dataset screens (logic/regions/reachable-screens.ts), and the two settings the record-read rows are judged with (the Big Key grant, the unlit-room grant, the medallion and pedestal overrides) | tests/game/one-rules-path.keep.test.ts | covered. Successor to the retired resolver.keep.test.ts, case for case: the old file guarded a second reachability graph and a second location-rule table, and both are gone |
| logic/evaluate-requirement + logic/record-statuses (the dataset's own requirement language, and the status of a row no world holds a location for) | tests/game/one-rules-path.keep.test.ts (inputs) + tests/story-events/t6-tracker.keep.test.ts (the event sweep) | partial. computeRecordStatuses has no unit test of its own |
| One rules path, end to end: the tracker reads the generator over the seed's placement or over Normal's own, and reads the rows that world has no location for from the dataset (apps/web/src/lib/game/tracker/tracker-statuses.ts) | none directly (exercised end to end by tests/regression/run-snapshot.test.ts, which records this reading for every save and seed in the corpus) | partial. The composition itself has no unit test |
| Bombs from the record: a world carrying the player's ledger asks that a bomb was ever held, a fill keeps the capacity reading alone (shared/randomizer/world/events/bombs-record.ts) | none directly (the regression net pins the 18 rows it moves) | none |
| logic/queries for detection, palace-fallback, dungeon-group/values, item-duplicates | tests/game/recommendations, tests/game/navigation, tests/simulation | covered |
| logic/queries for bundles, game-id, item-sprites, sprite-manifest, screen-tags | tests/storage/sprite-set-freshness.keep.test.ts (URL revision) + tests/randomizer/pool-listing-sprites.keep.test.ts (every item's art is a file the extraction writes) | partial. bundles, game-id, sprite-manifest, screen-tags untested |
| Navigation engine (flood-fill, strategies, BFS, cliffs, void-tiles) | tests/game/navigation (8 files) + tests/simulation + tests/e2e/flood-parity.keep.spec.ts | covered |
| Recommendations engine + detectors + diff/reconcile/registry, including the cross-kind sweep's grouping and the misfiled-entry repair | tests/game/recommendations (13 files) | covered |
| `screen:geography`, the hand-written detector that reports a screen whose location belongs to another area | tests/game/recommendations/registry-store.keep.test.ts (that it is installed alongside the screen strategy) | partial. Its own findings have no test |
| Progress tiers as one owner (shared/game/logic/queries/progress-tier.ts), replacing the five label tables that disagreed | tests/simulation/active-states.keep.test.ts (the chip labels) + tests/game/data/enumeration-generated-types.keep.test.ts (the category is not given a generated union) | covered |
| Review marks on the records: one `review` field per collection, written into the record file by the inspector through the record writers, gating nothing | tests/game/data/dataset-record-writers.keep.test.ts (a mark written through a writer reads back unchanged, emitted last) | covered. The userData review layer and its two stores are gone; the marks live in the dataset |
| Simulation engine | tests/simulation (20 files) | covered. The largest single suite in the repo |
| Story event records and the tracker's event sweep (ledger bits, vanilla bits, the derived pass, the older-file fallbacks, held items, a dungeon's own records) | tests/story-events/t6-tracker.keep.test.ts | covered |
| simulation/port.ts (WASM↔simulation bridge) | none directly (consumers are tested) | partial |

## Randomizer (`shared/randomizer/` + `apps/web/src/lib/game/randomizer-client/`)

| Area | Tests | Verdict |
|---|---|---|
| Placement -> physical plan coverage (every generated location is planned or reported, never silently dropped; dungeon prizes stay vanilla; shop slots plan as shop overrides at every depth, in all four shuffle modes, across the nine shelf shops, the potion hut and the bomb counter) | tests/randomizer/plan-covers-placement.keep.test.ts | covered |
| Reading a stored placement under a name this build no longer answers to | none | none by design. The rename map it guarded is gone (one name per record), so a stored seed under an older name reads as absent and is regenerated (`apps/web/src/lib/randomizer-placement-io.ts`, schema `placement-v2`) |
| The engine's world, read off the records (`shared/randomizer/world/world-from-records.ts`): the region collection IS the engine's region list, in the reference's own order, and the graph it builds carries each record's id, name and type; every passage joins two regions a record answers for and is named once; the dungeons span the wings their own records name, in the record's order; the transform-suppression flag is read off the record; and WHICH ROWS A SEED FILLS is one rule over kind, scope and the fill's event pairing (`shared/randomizer/world/seed-locations.ts`), pinned by count over the whole world, each dungeon, the shelves and the pond ladders. Plus the ratchet over the one thing the records still cannot say: which physical crossing a logical passage is | tests/randomizer/world-from-records.keep.test.ts | covered for regions, locations and dungeons; the crossing half is a bounded count (205 of 392 passages name a crossing, 439 crossings join a pair no passage joins), because a reference exit is a rule and a connection record is a tile |
| Locations are a closed world: every id-keyed table (the scope tables, the event items, the prize slots, the capacity and pond slot lists, lamps, bunny lists, the always-allow set, the priced entries, and every rule table's location rows) names a location the graph really declares, and Normal's placement fills every declared location and only locations the world declares | tests/randomizer/location-names-closed.keep.test.ts | covered |
| Creation-option wiring: every unlocked catalog row produces a value through `randomizerChoiceOverrides`, so a newly unlocked option cannot reach the panel without reaching the snapshot and the generator too; plus each row listed once (rows owned by a block stay out of the plain list) and the whole shop scope (mode, per-slot ticks, count and depth) really reaching the fill, with the count never exceeding the ticked set | tests/randomizer/option-wiring.keep.test.ts | covered |
| Option catalog (`shared/randomizer/world/options.data.ts`): field set, defaults, range bounds, choice values, and the `replacedBy` invariant that a superseded row names its successor and is always locked | none | none. The test that covered this diffed the catalog against a vendored copy of the upstream option source, which is no longer kept in the repo. Recovering it needs a check written against the catalog itself |
| Progressive tier tick sets (`shared/randomizer/world/progressive/`): representative sets rolled over many seeds each, a returned placement being the proof it plays, and the load-bearing rungs pinned as refusals the generator names up front instead of unfinishable seeds | tests/randomizer/progressive-tier-generation.keep.test.ts | covered |
| Tier-tick consequences: the lines the Items tab shows for a tick set stand in lockstep with the switches the derivation actually masks on, so the wording cannot drift from what the seed does | tests/randomizer/progressive-tick-consequences.keep.test.ts | covered |
| Progressive tier masks in the built wasm (progressive_grants.c): a family's mask armed the way a session arms it, then the grant resolver asserted to hand over the lowest rung still present at or above the tier held, with an unarmed family walking the full ladder, so the C mask and the TS ladder are held to the same reading and neither can drift alone | tests/randomizer/progressive-tier-probe.keep.test.ts | covered. Skips without the wasm, asset blob or vault fixture |
| Shops tab model (`ShopSlotsBlock/behavior/`): the count control and the total sentence both read the OPENED set, so custom mode shows the ticked count, unticking lowers both, and neither can climb as the ticked ceiling falls; the count is drawn as a slider only in the modes that take a number out of the ticked set and as a read-out in the ones the ticks alone decide, so no bar sits full while its number falls; sequential clamps to the ticked set; vanilla says nothing is shuffled; the cards split by world, the world words dropped from their titles and every title left unique; and a brand-new profile's scope ticks every shelf and bomb slot while leaving the potion hut's three cauldrons unticked, through the frozen snapshot and back | tests/randomizer/shop-slots-panel.keep.test.ts | covered |
| Hook-owned save-byte registry (core/game-hooks/save_bytes.h): no claim overlaps, the whole allocation stays inside 0xF406-0xF4FD, and the TS mirror `apps/web/src/lib/game/save-file/hook-save-bytes.ts` matches the C header | tests/randomizer/hook-save-bytes.keep.test.ts | covered |
| Potion/price dependency rule (`shared/randomizer/world/potion-price/`): a hut cauldron given to the shuffle takes its potion off the bottle-price list, enumerated over every shuffle mode x cauldron subset x price choice: the row masked, the frozen snapshot carrying the mask, the roll refusing the content even from a hand-edited snapshot, fairies and bees never blocked, a potion price gated on reaching the seller, and a counted bottle demand gated on that many bottles while an uncounted one still asks for a single bottle; plus each cauldron asserted on its own, blocking only its own content and greying only that one price row (`ShopPricesBlock/behavior/bottle-content-rows`), with the row given straight back when that cauldron is unticked | tests/randomizer/potion-price-rule.keep.test.ts | covered |
| Capacity/pond dependency rule (`shared/randomizer/world/capacity-pond/`): the master switch's off state, and every reachable pairing of pond mode x family mode x the control that moved, proving no configuration leaves the explosives or projectiles upgrades with no source at all: settled, stable, and closed under every move the two tabs still offer, through the real snapshot writer | tests/randomizer/capacity-pond-rule.keep.test.ts | covered |
| Wishing-pond model (`shared/randomizer/world/pond/`): the rupee decomposition and its volleys, the three modes' throw/price/prize schedules, the snapshot adapter and its fallbacks (a retired mode included), the worst-case wallet reading of a prize, the pond's own receipt lines, the one ramp every counted demand reads (each kind reaching its own two ends at the same two rungs, a rupee demand staying the throw price, the bottle carrying a count), and the item demand's eligibility rule, its early-to-late ranking and its fallback when nothing is eligible | tests/randomizer/pond-model.keep.test.ts | covered |
| Fairy-pond generation: the six native slots each a location the graph declares, each named for its pond and its number, a wish pond's pair asserted to BE rungs 1 and 2 of her ladder while no plain prize rung is any record's name, every mode beatable over many seeds, prize slots really carrying pool items, the wallet rule gating them, the shared switch giving all three ponds the capacity pond settings without rewriting their own rows, a legacy-default world byte-identical to the pre-option generator, and the demands a mixed ask rolls reading back identical to what the options panel previews from the same seed, on seeds that needed a retry too | tests/randomizer/pond-generation.keep.test.ts | covered |
| Wishing-pond core seams (pond_plan.c, pond_toss_draw.c) in the built wasm, gate on and gate off: price/amount/bank/wait, the throw counter's once-each anti-farm property, the refund of a throw that wins nothing, the gem decomposition and the mixed volley each gem is drawn in, the price the vanilla cost prompt quotes, the hold that keeps the player inside the closing palette fade, and the host lines replacing the vanilla wording, the award line's reading of what the water has left included | tests/randomizer/pond-core-probe.keep.test.ts | covered. Skips without the wasm, asset blob or vault fixture |

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
| Story events: byte parity with the master core (every story field at zero) on every save-state fixture, through the headless harness in tests/story-events/core-harness.ts | tests/story-events/t1-parity.keep.test.ts (skips without a baseline core; recipe in the file header) | covered |

## Global stores (`apps/web/src/stores/`)

| Area | Tests | Verdict |
|---|---|---|
| data-view-store | covered (via tests/data-inspector) | covered |
| boot-progress, delivery-queue, exclusive-insets, game-ui, hud-settings, location-notification, navigation-overlay, refresh-rate, search, shadow-editor, simulator, sprite-availability (13 stores) | none directly | none |
| Sprite-set activation (which ROM the shared base points at, `lib/sprites/sprite-rom.ts`) | tests/randomizer/pool-listing-sprites.keep.test.ts | covered: the no-active-profile fallback the creation form depends on |

## Not counted as app-feature coverage

`tests/parallel/*` (automation-launch, link-deps, verdict) test the `scripts/parallel/*.mjs` worktree/agent-orchestration CLI, which is dev tooling and not an app feature. Kept for completeness, excluded from the verdicts above.
