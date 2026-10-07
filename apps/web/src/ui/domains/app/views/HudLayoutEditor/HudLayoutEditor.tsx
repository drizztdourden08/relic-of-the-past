/* @layer renderer-components @kind component */
/**
 * HudLayoutEditor arranges the app-drawn HUD and shows it on the surface it will
 * actually be drawn over.
 *
 * FOUR PARTS, and the split is the whole design. A TOOLBAR across the top is
 * the only way anything is added. Its small icon buttons are grouped by what
 * they make, and it also carries what the preview is judged against: the glyph
 * pack it draws with, the display ratio and the ground. An OUTLINE on the left
 * is the document as a tree, with drag to reparent and reorder, because what a
 * player moves in a tree is a node's place among its siblings and that is not
 * something a position on a stage can say. The STAGE in the middle is the play
 * field at true scale, drawn by the game's own renderer over the game's own
 * ground. An INSPECTOR on the right is the selected node's box, plus what a
 * container does with its children.
 *
 * A SLOT NUMBER IS NEVER VALIDATED AGAINST A DEVICE. Any number is legal.
 * The scheme this session happens to be running under is only consulted for
 * two quiet, background things: sizing the preview's slot list realistically,
 * and noting (never blocking) when a placed slot sits past what that scheme
 * currently reaches. Neither is a control a player sets here.
 *
 * Nothing is written until Save. The draft is a memento (`useLayoutDraft`), so
 * walking away leaves the live HUD exactly as it was found.
 *
 * This view is the only tier here that touches data: the layout store, the
 * profile's saved layouts, its input profiles and its glyph packs. Everything
 * below it takes props.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { ResizeHandle } from '@ds/primitives/ResizeHandle';
import { FullScreenLayer } from '@ds/composites/FullScreenLayer';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { DEFAULT_LAYOUT, validateLayout } from '@shared/hud/layouts';
import { usePlacedLayout } from '@domains/hud/views/HudLayoutView';
import { useReducedMotion } from '@domains/hud/compounds/HudNodeRenderer';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { MotionPreviewContext, useMotionPreviewState } from './behavior/motion-preview';
import { EditorStepContext } from './behavior/editor-step';
import { GridSolveContext } from './behavior/grid-solve';
import { useGlyphPacks } from './behavior/useGlyphPacks';
import { useLayoutDraft } from './behavior/useLayoutDraft';
import { useNodeEdits } from './behavior/useNodeEdits';
import { useEditorSchemes } from './behavior/useEditorSchemes';
import { useSampleState } from './behavior/useSampleState';
import { usePanelResize } from './behavior/use-panel-resize';
import { SlotSchemeContext } from './behavior/slot-scheme';
import { nodeById } from './behavior/node-edits';
import { FlexSlotContext, slotLookup } from './behavior/flex-slots';
import { solveLookup } from './behavior/grid-solve-lookup';
import { EDITOR_GROUNDS, EDITOR_RATIOS } from './HudLayoutEditor.constants';
import { EditorStage } from './sub-components/EditorStage';
import { EditorStepStrip } from './sub-components/EditorStepStrip';
import { EditorToolbar } from './sub-components/EditorToolbar';
import { GlyphPackPicker } from './sub-components/GlyphPackPicker';
import { NodeInspector } from './sub-components/NodeInspector';
import { OutlinePanel } from './sub-components/OutlinePanel';
import { PresetBar } from './sub-components/PresetBar';
import './HudLayoutEditor.css';
import './sub-components/HudLayoutEditor.panels.css';
import './sub-components/HudLayoutEditor.pickers.css';
import './sub-components/HudLayoutEditor.inspector.css';
import './sub-components/HudLayoutEditor.fields.css';
import './sub-components/HudLayoutEditor.geometry.css';
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { HudLayout } from '@shared/types/hud';
import type { HudLayoutEditorProps } from './HudLayoutEditor.type';

const HudLayoutEditor = (props: HudLayoutEditorProps) => {
  const { layoutId, onClose, onCommitted } = props;

  const glyphs = useGlyphPacks();
  const schemes = useEditorSchemes();
  // The scheme in force decides which layout is open. Captured once, so a save
  // that forks does not reopen the editor on the layout it just left when the
  // fork moves the live id.
  const liveLayoutId = useHudLayoutStore((s) => s.layoutId);
  const openId = useRef(layoutId ?? liveLayoutId);

  /** A save points the edited scheme at what was saved: a fork nothing wears
   *  would be a copy made for no reason. */
  const committed = useCallback((saved: HudLayout) => {
    const scheme = schemes.selected?.id;
    if (scheme) void schemes.assignLayout(scheme, saved.id);
    onCommitted?.(saved);
  }, [onCommitted, schemes]);

  const draft = useLayoutDraft(openId.current, committed);
  const edits = useNodeEdits(draft.apply);

  const [ratioId, setRatioId] = useState(EDITOR_RATIOS[0].id);
  const [ground, setGround] = useState(EDITOR_GROUNDS[0]?.file ?? '');

  const layout = draft.draft ?? DEFAULT_LAYOUT;
  const packId = layout.glyphPack ?? AUTO_PACK_ID;
  const ratio = EDITOR_RATIOS.find((entry) => entry.id === ratioId) ?? EDITOR_RATIOS[0];
  const slots = schemes.selected?.slots ?? [];

  const sample = useSampleState({ packId, packs: glyphs.packs, slots, view: ratio.view });
  const ctx = useMemo(
    () => ({ hearts: sample.hearts, filledSlots: sample.filledSlots, scope: sample.dataScope }),
    [sample.dataScope, sample.filledSlots, sample.hearts],
  );
  const placed = usePlacedLayout(layout, sample.view, ctx);
  // ONE SOLVE, TWO SURFACES (§50). The panel's lattice draws its columns and
  // rows at the proportions the engine actually gave them, which is the same
  // answer the stage's own overlay and echo read - so a cell in the panel is the
  // shape of the cell on the stage instead of a square standing in for it.
  const gridSolve = useMemo(() => solveLookup(placed.all, ctx), [ctx, placed.all]);
  // AND ONE PLACEMENT, TWO SURFACES (§58). The flex manipulation strip draws one
  // cell per child at the size that child was really given, which is the same
  // claim the lattice makes for its tracks and is answered here, not
  // measured a second time.
  const flexSlots = useMemo(() => slotLookup(placed.all), [placed.all]);

  const positions = useMemo(
    () => sample.slots
      .map((slot) => slot.position)
      .filter((position): position is GlyphPosition => !!position),
    [sample.slots],
  );

  const createPack = useCallback(async () => {
    const pack = await glyphs.createPack(`My glyphs ${glyphs.custom.length + 1}`);
    if (pack) draft.setGlyphPack(pack.id);
  }, [draft, glyphs]);

  const deletePack = useCallback(async (id: string) => {
    await glyphs.deletePack(id);
    // Leaving a deleted pack selected would silently fall through to the
    // device's own family and read as the setting having done nothing.
    if (packId === id) draft.setGlyphPack(AUTO_PACK_ID);
  }, [draft, glyphs, packId]);

  const target = edits.targetId(draft.draft);
  const selected = draft.draft && edits.selectedId ? nodeById(draft.draft, edits.selectedId) : null;

  // The WHOLE document's own validator is the "blocks save" mechanism for
  // every `ValueField`/`ExpressionInput` in the panel at once. An invalid
  // expression anywhere makes `errors` non-empty, which is what disables
  // Save/Save as below, and `warnings` is `validate-motion-warnings.ts`'s own
  // reflow notes, rendered on the offending node's Animation section.
  const validation = useMemo(() => validateLayout(layout), [layout]);

  // Both rails persist their own width in the view store (never the document,
  // because a panel width is a fact about the editor, not the HUD); see the hook's
  // own header for why the drag itself never touches that store.
  const panels = usePanelResize();

  // The editor's own step, read HERE because this is the View: every stepped
  // input below takes it as a prop, which is what keeps those inputs reusable
  // and measurable (§55).
  const editorStep = useHudEditorViewStore((s) => s.editorStep);
  const setEditorStep = useHudEditorViewStore((s) => s.setEditorStep);

  // Motion's scrub/play head. Created here because the View is the only tier
  // allowed to own state the whole editor reads, and carried as context for
  // `formula-scope.ts`'s reason: exactly two places consume it (the stage and
  // one control in Motion) and neither is a prop away. Under reduced motion
  // every `animation` is silenced at the source (§27.6), so the transport
  // reports itself disabled instead of driving a clock nothing samples.
  const motionPreview = useMotionPreviewState(useReducedMotion());

  return (
    <MotionPreviewContext.Provider value={motionPreview}>
    <Box className="hud-editor-portal">
      <FullScreenLayer onClose={onClose} title="HUD Layout Editor">
        <Box className="hud-editor">
          <EditorToolbar
            insert={edits.insert}
            layouts={draft.layouts}
            draftId={layout.id}
            onStartFrom={draft.startFrom}
            slotNumbers={slots.map((slot) => slot.index)}
            glyphPacks={glyphs.packs}
            ratio={ratio}
            onRatioChange={setRatioId}
            ground={EDITOR_GROUNDS.find((entry) => entry.file === ground) ?? null}
            onGroundChange={setGround}
            targetLabel={target ?? 'nothing'}
          />

          <Box className="hud-editor__body">
            <Box ref={panels.outlineRailRef} className="hud-editor__rail" style={{ width: panels.outlineWidth }}>
              <OutlinePanel
                doc={layout}
                selectedId={edits.selectedId}
                slotNumbers={slots.map((slot) => slot.index)}
                onSelect={edits.select}
                onRemove={edits.remove}
                onDrop={edits.drop}
              />
            </Box>

            <ResizeHandle axis="horizontal" label="Resize outline panel" resize={panels.outlineResize} />

            <Box className="hud-editor__stage-column">
              <EditorStage
                placed={placed.all}
                sample={sample}
                ground={ground}
                selectedId={edits.selectedId}
                onSelect={edits.select}
              />
              <Text className="hud-editor__hint">
                Every placeholder is dealt a sample item so the density of a group can be judged.
                {sample.live ? ' Hearts and counters come from the running save.' : ' Nothing is running, so the counters are made up too.'}
                {' '}None of it is written anywhere.
              </Text>
              {/* The editor's own settings, under the preview and in the centre
                  column, which §55 keeps for anything that changes how the panel
                  behaves instead of what the document says. */}
              <EditorStepStrip step={editorStep} onStepChange={setEditorStep} />
            </Box>

            <ResizeHandle axis="horizontal" label="Resize inspector panel" resize={panels.inspectorResize} />

            <Box ref={panels.inspectorRailRef} className="hud-editor__rail" style={{ width: panels.inspectorWidth }}>
              {/* The previewed scheme's slots, for the three fields that ask
                  for a slot NUMBER and can now show what that number draws
                  (`behavior/slot-scheme.ts`). Provided here, not passed down,
                  because it is a fact about the session and not about the selected
                  node (the same reason `formula-scope.ts` gives for its own). */}
              {/* Every number in the inspector with no step of its own moves by
                  the strip's step (§56). The View is the only thing that reads
                  the store for it; `ValueField` reads the context. */}
              <EditorStepContext.Provider value={editorStep}>
              <SlotSchemeContext.Provider value={sample.slots}>
              <GridSolveContext.Provider value={gridSolve}>
              <FlexSlotContext.Provider value={flexSlots}>
              <NodeInspector
                node={selected}
                doc={draft.draft}
                onPatch={(patch) => { if (edits.selectedId) edits.patch(edits.selectedId, patch); }}
                onDrop={edits.drop}
                scope={sample.dataScope}
                glyphPacks={glyphs.packs}
                selectedId={edits.selectedId}
                onSelectNode={edits.select}
                reflowWarnings={validation.warnings}
              />
              </FlexSlotContext.Provider>
              </GridSolveContext.Provider>
              </SlotSchemeContext.Provider>
              </EditorStepContext.Provider>

              <Text className="hud-editor__label">Glyphs</Text>
              <GlyphPackPicker
                value={packId}
                packs={glyphs.packs}
                custom={glyphs.custom}
                positions={positions}
                busy={glyphs.busy}
                onChange={draft.setGlyphPack}
                onCreatePack={() => { void createPack(); }}
                onDeletePack={(id) => { void deletePack(id); }}
                onImport={(id, position, file) => { void glyphs.importImage(id, position, file); }}
                onRemove={(id, position) => { void glyphs.removeImage(id, position); }}
              />

              <PresetBar
                layouts={draft.layouts}
                draft={layout}
                dirty={draft.dirty}
                busy={draft.busy}
                errors={validation.errors}
                onStartFrom={draft.startFrom}
                onRename={draft.rename}
                onSave={() => { void draft.save(); }}
                onSaveAs={() => { void draft.saveAs(`${layout.name} copy`); }}
                onReset={draft.reset}
              />
            </Box>
          </Box>
        </Box>
      </FullScreenLayer>
    </Box>
    </MotionPreviewContext.Provider>
  );
};

export { HudLayoutEditor };
