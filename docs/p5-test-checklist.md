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
