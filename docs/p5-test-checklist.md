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
