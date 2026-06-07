<!-- @layer docs @kind doc -->
# P5 manual-test checklist — parked-item splits

These files had **no runtime tests**, so each split was behavior-preserving by
verbatim extraction + `tsc`/`analyze` green, but the *behavior* must be confirmed
by hand. Walk through each item below in the running app (`npm run dev -- -- --no-focus --muted`).
All work is local (unpushed) — nothing ships until you've signed off.

Legend: ☐ = to verify.

---

## ScreenEditorDialog (was 638) → `screen-editor/`
Split into: `screen-editor-constants` (options + id/slug helpers), `screen-editor-prefill`
(`applyPrefill`), `useScreenEditorForm` (field state + prefill/overworld effects + create
handlers), `useScreenEditorDerived` (mismatches/id/options/codegen/`handleWrite`),
`useScreenEditor` (compose), `ScreenEditorFieldsTop` + `ScreenEditorFieldsBottom` (render),
shell stays at `ScreenEditorDialog.tsx`. **Note:** 2 pre-existing type bugs (variant
flag `address` stored as string vs `number` in `VariantCondition`) were preserved
verbatim — not introduced, not fixed. Flag for a separate fix if you want.

Open via Dataset & Mapping widget → "✏️ Edit Screen":
- ☐ **Open on a dungeon room** → Type=Dungeon, Palace Index preselected, Dungeon name
  locked, World locked to meta, Area/Location auto-filled from meta.
- ☐ **Open on an interior** (non-dungeon) → Type=Interior, World editable, Area/Location empty.
- ☐ **Change Palace Index** → Area/Location/World cascade to the new dungeon's meta.
- ☐ **Switch Type to Overworld** → Grid X/Y + World become locked/derived from room index.
- ☐ **Area "+ New Area…"** → inline create; Add commits + selects it; Cancel aborts.
- ☐ **Location "+ New Location…"** → same; disabled until an Area is chosen.
- ☐ **Tags** add/remove via TagPicker reflect in preview.
- ☐ **Has Variant** → toggle on; each Condition type (check/flag/entrance/progress)
  shows the right fields; values flow into the generated code.
- ☐ **Edit an existing screen with a variant** → all variant fields pre-fill correctly.
- ☐ **Preview step** shows correct target file path + generated TS.
- ☐ **Accept & Write** writes the screen (and any new areas/locations) and closes; a
  write error shows inline without closing.
- ☐ **Mismatch warnings** appear when an existing dungeon's location/world differs from meta.
- ☐ Reopen the dialog → fields re-prefill cleanly (no stale carry-over from prior open
  except the known unused condition fields).

---

## useNavigation (was 579) → `nav-flood/`
The 537-line `handleRun` flood-fill closure was extracted into pure/context helpers:
`nav-flood/prepare` (inventory set, overworld blockers, Link start-context + uncle stamping),
`nav-flood/indoor-entrances` (entrance/stair/walk-boundary collection + respawn IDs),
`nav-flood/propagate` (per-screen run + border-transition BFS, returns responses + overworld
bundle), `nav-flood/finalize` (layer-toggle annotation, indoor screen bundle, fall-hole
landings), and `nav-flood/use-nav-connections` (internal/external classification + dedup).
`handleRun` is now a thin orchestrator. **This is the highest-behavior-risk split** — drive
the Navigation widget with `--auto-flood` and exercise:
- ☐ **Overworld screen** (light & dark world): flood overlay fills the reachable area;
  reachable/total tile counts look right; the big-screen group (2×2) propagates.
- ☐ **Overworld with guards/barriers** (e.g. tutorial guards, the uncle): those tiles
  block the flood; regular enemies do NOT block.
- ☐ **Indoor room** (cave/house): flood fills; Link's start tile is correct.
- ☐ **Indoor dungeon, dual-layer room**: layer-aware flood; upper/lower correct;
  layer-toggle doors annotated (▲▼) on the connection edges.
- ☐ **Entrances panel**: doors/respawns/stairs listed with correct names & icons;
  starting-layer (▲ Upper / ▼ Lower) shown per entrance.
- ☐ **Edges / Internal / Fall-hole** sections populate as before.
- ☐ **Early-game uncle** (Link's Uncle not yet collected): his footprint blocks tiles;
  after collecting, he no longer blocks.
- ☐ **Auto-run on item/equipment change** (gloves/boots/flippers/hookshot/hammer):
  re-floods and reachability updates.
- ☐ **Screen change** clears stale overlay/bundle; **auto-second-pass** fires on transitions.
- ☐ Multi-screen indoor room bundle (2×2 / shape) renders the right grid dimensions.

---

## single-screen.ts (was 536) → flood-fill BFS split
Core pathfinding BFS (deterministic). Split into: `bfs-helpers` (2×2 body
primitives: bodyTiles/getNewTiles/findStartBody/isBodyPassable/recordBorderTransition/
canLeaveLedge/evaluateEntry + QuadrantBounds + SWAP_STAIR_ATTRS), `single-layer`
(floodFillBFS), `dual-layer-steps` (ledge-fall + stair-traverse cross-layer handlers),
`dual-layer-result` (body→tile merge + per-layer grids), `dual-layer`
(floodFillBFSDualLayer orchestrator). `single-screen.ts` is now a re-export barrel.
**Note:** two dead locals (`grid`/`rawAttr` at the dual-layer loop top, never read)
were dropped — behavior-identical. Exercise via the flood overlay:
- ☐ **Single-layer overworld/cave flood** matches pre-split (same reachable area,
  same border/entrance transitions, same req markers, hookshot targets).
- ☐ **Ledges** block from the wrong side; falling in the ledge direction lands you
  on layer 1 correctly (dual-layer rooms).
- ☐ **Stairs** auto-traverse to the other layer (vertical entry only; side entry blocked);
  stair-tile arrows render on the target layer.
- ☐ **Dual-layer dungeon room**: merged reachability + per-layer grids correct;
  tile-layer (upper/lower/both) classification matches what TileInspector shows.
- ☐ **Obstacles/water** require the right item (gloves/hammer/flippers) and the req
  set propagates (reqGrid path requirements unchanged).
- ☐ Quadrant-bounded runs (multi-screen rooms) still confine the flood correctly.

---

## HomeTab.tsx (was 435) → `home-tab/`
Save-management form. Split into: `home-tab-helpers` (formatRelativeTime,
defaultSaveName, plus de-duplicated `ensureGameRunning` and `captureCanvasScreenshot`),
`home-tab-data` (fetchQuickSlots/fetchNormalSaves/fetchAutoSaves — return null on
error to preserve "don't update state on failure"), `useHomeTabSaves` (all state +
handlers), `HomeTabColumns` + `HomeTabDialogs` (render). Shell keeps info cards + hero.
Open a profile's Home tab:
- ☐ **Info cards** (ROM / Last Played / Created / Window) show correct values.
- ☐ **Hero card** = most recent normal save; Load works.
- ☐ **Quick saves** 1–12: Save (disabled until game running) writes + refreshes the
  slot screenshot/timestamp; Load starts the game if needed, then loads.
- ☐ **New Save** dialog: default name prefilled, Enter confirms, creates a save with
  a canvas screenshot; list refreshes.
- ☐ **Normal save** Load / Overwrite (confirm dialog) / Delete (confirm dialog) / Rename
  all work and refresh.
- ☐ **Auto-saves** list: Load + Delete work.
- ☐ **Play sessions** list renders (up to 20).
- ☐ Switching profiles reloads all four sections; an IPC error leaves prior data intact
  (no flash to empty).

---

## input-manager.ts (was 391) → lifecycle + events helpers
Live renderer input engine (stateful class, no tests). Method bodies relocated
**verbatim** into `input-manager-lifecycle.ts` (startInput/stopInput/refreshDevicesImpl)
and `input-manager-events.ts` (key/gamepad handlers, rebuildMaps, gamepad VID/PID
resolve, poll frame, text-input guard); types → `input-manager-types.ts`. The class
keeps fields, constructor, public API, and thin delegators; arrow-field handlers keep
stable identity for add/removeEventListener. **Note:** fields were made non-private
(compile-time only — zero runtime change) so the helpers can operate on the instance.
Exercise across input surfaces:
- ☐ **Keyboard** game input works (movement/buttons) in-game; bindings from the active profile.
- ☐ **Gamepad** connect/disconnect detected; buttons/axes drive the game; VID/PID resolves
  (controller shows correct name in Input Calibration).
- ☐ **HID controller** (WebHID/IPC path) input works; connect/disconnect updates device list.
- ☐ **Function actions** (save/load-state shortcuts, cheats, pause toggle) fire on keydown;
  key-up handlers work (enhanced save-slot hold).
- ☐ **Input suppression**: opening a menu/overlay zeroes game input; closing restores it.
- ☐ **Pause**: auto-pause on controller disconnect; auto-resume on input; manual toggle;
  audio suspends/resumes with pause.
- ☐ **Text inputs** (rename, search fields) don't trigger game/function input; Escape always
  reaches the app menu.
- ☐ **Input Calibration / Tester** pages: per-frame HID/gamepad state + raw-input rebinding
  visualizations update live.
- ☐ Stick/trigger calibration loads on first start; rebinding UI (RawInput) sees rising edges.

---

## orchestrator.ts (was 366) → flood-fill orchestration split
Pure flood-fill orchestrator (deterministic). Split into: `screen-prep`
(prepareScreen / constrainVoidTiles / findStartPosition), `flood-options`
(FloodFillOptions type), `orchestrator-helpers` (findEntrancePositions / buildBorders),
`flood-paths` (runDualLayerFlood + runSingleLayerFlood), `connections`
(getAdjacentRoom + getConnections). `orchestrator.ts` is now a thin dispatcher
(useDualLayer ? dual : single) + re-exports floodFillScreen / getConnections /
FloodFillOptions. Verbatim. Largely covered by the single-screen/useNavigation
flood tests — additionally confirm:
- ☐ **Overworld single-layer** flood + connections (edge bundles, item-gated tiles) unchanged.
- ☐ **Indoor dual-layer room** flood: void-constraint still blocks structural void;
  ledge arrows only show when the layer-0 approach tile is reachable.
- ☐ **staircaseType 2** rooms: layer changes blocked → single-layer BFS on the start layer.
- ☐ **Connections widget**: inter-screen, inter-room, and intra-room (scroll-boundary)
  connections all derive correctly; contiguous-run bundling + item-gap splitting unchanged.

---

## NavReviewPanel.tsx (was 335) → `nav-review/`
Connection-review panel. Split into: `types`, `nav-review-styles` (dir labels/colors,
status buttons, requirement options, styles), `nav-review-controls` (StatusRow /
RequirementEditor / TransitTypePicker), `useNavReview` (load/persist + screen/point
review state). Main component keeps the render. Open the Nav Review panel for a screen:
- ☐ Summary (reviewed/total, tiles, bundle/entrance counts) correct.
- ☐ **Screen-level** status (✓/✗/⚠) + comment persist (debounced save) and reload.
- ☐ **Border bundles** grouped by N/S/E/W with free/gated counts; expand shows tiles +
  requirements; **Edit requirements** toggles chips and applies; corrected badge shows.
- ☐ **Entrances** list: position/room/requirements; **Transit type** picker persists;
  requirement editor persists.
- ☐ Point-level status + comment persist per bundle/entrance and reload after reopen.

---

## GameLayer.tsx (was 326) → render-loop hooks
The two ~100-line WebGL render loops were extracted into `behavior/useEdgeGlowLoop`
and `behavior/useShadowCastingLoop` (each a useEffect-hook taking the component's
canvas/renderer refs + status/canvasKey). Component keeps canvas elements, fit/style
effects, controller-pause/dbl-click effects, and render. Verbatim relocation
(deps stay [status, canvasKey], eslint-disable added on the relocated effects).
Run the game and verify:
- ☐ Game canvas renders; resize/aspect changes refit canvas + overlays.
- ☐ **Edge glow** (overworld, extended viewport / widescreen): mirror glow on black
  bars; freezes during text/dialogue; fades out on screen transition and back in.
- ☐ **Shadow casting** (when enabled, postProcessingShadows): per-screen heightmap/light
  shadows render; debug mode toggles; live edits in Shadow Editor reflect immediately.
- ☐ Toggling edgeEffect / shadowCasting settings enables/disables the respective loop.
- ☐ Controller-disconnect pause overlay + double-click-to-resume still work.
- ☐ Crash/reset → idle remounts the canvas (canvasKey bump) and restarts cleanly.

---

## ProfileHub.tsx (was 302) → `profile-hub/`
Profile settings hub. Split into: `apply-settings-effects` (persist + parent
notifications + HUD-store sync + live push + restart toast; `syncHudStore`),
`useProfileSettings` (settings load/persist, pause tracking, toasts), `ProfileHubBody`
(tab nav + content panels). Shell keeps the header (Play/Pause/Stop/Reset). Open
a profile:
- ☐ Header actions: Play starts; while running Pause/Resume toggles, Stop, Reset work;
  pause state reflects InputManager.
- ☐ All 7 tabs (Home/Settings/Audio/Gameplay/HUD/Controls/Haptics) switch and render;
  controlled-tab (from titlebar Home) + internal tab both work.
- ☐ Changing a setting persists to disk; **live** settings apply immediately while running;
  **restart-required** settings show the danger toast once (dismissable, cleared on stop).
- ☐ HUD settings changes sync to the live HUD store (mode/style/ratio/parts/etc).
- ☐ Parent notifications fire: window mode, viewport/aspect, master volume (+ titlebar mute
  override), perf-in-title, save-slot shortcut, edge effect, shadow casting, fullscreen toggle.
- ☐ Function-mapping changes push to InputManager.
- ☐ On mount, saved config loads and applies to all of the above; external `settings:change`
  events (debug widget) are handled.

---

## ShadowEditorPanel.tsx (was 285) → shadow-editor/ inspectors
Dev shadow-casting editor panel. The three body sections were extracted into
`shadow-editor/ShadowShapeInspector`, `ShadowLightInspector`, and
`ShadowGlobalSettings` (prop names kept identical to the JSX, so render is verbatim).
Panel keeps header/toolbar/tool-options/footer. **Dev-only tool** (open via TitleBar →
Advanced → Shadow Editor in dev). Verify:
- ☐ Tool select (Select/Shape/Draw/Light/Area); shape-creation options (sides/corner-radius/
  height) and light-creation options (intensity/radius) show for the right tools.
- ☐ **Select a shape** → inspector edits X/Y/W/H/rotation, polygon sides/corner-radius,
  height level; Delete removes it.
- ☐ **Select a light** → inspector edits X/Y/radius/intensity/cast-shadows; Delete removes it.
- ☐ **Nothing selected** → Sun (enable/angle/elevation/intensity), Atmosphere (ambient/
  softness/day-night + cycle speed), Height Levels editor all work.
- ☐ Header: preview/debug toggles, undo/redo, Save (enabled only when dirty), close.
- ☐ Footer shows current screen # + shape/light counts; edits reflect live in the overlay.

---

## ControlsSettings.tsx (was 280) → controls/ columns
Render-only split (logic already in useControlsSettings). Extracted the three
columns into `controls/ControlsSidebar`, `ControlsMain`, `ControlsDevices`
(each takes the `ctrl` bundle; JSX verbatim). Shell keeps the rebind-listener +
confirm-preset/delete modals. Open Profile → Controls:
- ☐ **Profiles sidebar**: list + icon strip; select/rename/delete/create input profiles;
  collapse/expand toggle.
- ☐ **Game Controls tab**: SNES button mappings list; rebind (listener modal captures
  key/gamepad/HID) + clear; Required Inputs summary with connected/disconnected dots.
- ☐ **Shortcuts & Functions** + **Cheats** tabs: function-action bindings rebind/clear;
  reserved "Open Menu = Esc" row shown.
- ☐ **Devices column**: detected devices listed; click icon or drag onto bindings →
  confirm-preset dialog applies the controller preset (overwrites bindings); collapse toggle.
- ☐ Delete-profile confirm dialog works; changes persist to the active input profile.

---

## strategies/dual-layer.ts (was 271) → build-result extracted
Core-nav `DualLayerStrategy` (deterministic). The 119-line `buildTileResult` body
moved verbatim into `dual-layer-build-result.ts` (`buildDualLayerTileResult`, which
also owns `SWAP_STAIR_ATTRS` to avoid a cycle); the class keeps `expand` + the
ledge/stair cross-layer handlers + a thin delegate. Largely covered by the
dual-layer flood tests (single-screen / useNavigation entries) — additionally:
- ☐ Dual-layer dungeon room reachability identical (merged grid, per-layer grids,
  tileLayer upper/lower/both, reqGrid) to pre-split.
- ☐ Stair-swap + ledge-fall cross-layer transitions still mark traversed tiles and
  produce the same reachable set.
