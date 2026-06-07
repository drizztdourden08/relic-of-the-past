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
