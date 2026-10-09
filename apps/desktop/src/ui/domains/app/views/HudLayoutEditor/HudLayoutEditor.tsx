/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ScreenWindow, ResizeHandle } from '@drizztdourden08/tessera/composites';
import { useReducedMotion } from '@domains/hud/compounds/HudNodeRenderer';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { MotionPreviewContext, useMotionPreviewState } from './behavior/motion-preview';
import { EditorStepContext } from './behavior/editor-step';
import { GridSolveContext } from './behavior/grid-solve';
import { usePanelResize } from './behavior/usePanelResize';
import { SlotSchemeContext } from './behavior/slot-scheme';
import { FlexSlotContext } from './behavior/flex-slots';
import { useHudLayoutEditor } from './behavior/useHudLayoutEditor';
import { EDITOR_GROUNDS } from './HudLayoutEditor.constants';
import { EditorStage } from './sub-components/EditorStage';
import { EditorStepStrip } from './sub-components/EditorStepStrip';
import { EditorToolbar } from './sub-components/EditorToolbar';
import { GlyphPackPicker } from './sub-components/GlyphPackPicker';
import { NodeInspector } from './sub-components/NodeInspector';
import { OutlinePanel } from './sub-components/OutlinePanel';
import { PresetBar } from './sub-components/PresetBar';
import './HudLayoutEditor.css';
import './sub-components/HudLayoutEditor.panels.css';
import './sub-components/HudLayoutEditor.outline.css';
import './sub-components/HudLayoutEditor.pickers.css';
import './sub-components/HudLayoutEditor.inspector.css';
import './sub-components/HudLayoutEditor.fields.css';
import './sub-components/HudLayoutEditor.geometry.css';
import type { HudLayoutEditorProps } from './HudLayoutEditor.type';

const HudLayoutEditor = (props: HudLayoutEditorProps) => {
  const { onClose } = props;
  const {
    glyphs, draft, edits, setRatioId, ground, setGround, layout, packId, ratio, slots,
    sample, placed, gridSolve, flexSlots, positions, createPack, deletePack, target, selected, validation,
  } = useHudLayoutEditor(props);

  const panels = usePanelResize();
  const editorStep = useHudEditorViewStore((s) => s.editorStep);
  const setEditorStep = useHudEditorViewStore((s) => s.setEditorStep);
  const motionPreview = useMotionPreviewState(useReducedMotion());

  return (
    <MotionPreviewContext.Provider value={motionPreview}>
    <Box className="hud-editor-portal">
      <ScreenWindow onClose={onClose} title="HUD Layout Editor">
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
            <Box id="hud-editor-outline" className="hud-editor__rail" style={{ width: panels.outlineWidth }}>
              <OutlinePanel
                doc={layout}
                selectedId={edits.selectedId}
                slotNumbers={slots.map((slot) => slot.index)}
                onSelect={edits.select}
                onRemove={edits.remove}
                onDrop={edits.drop}
              />
            </Box>

            <ResizeHandle label="Resize outline panel" controls="hud-editor-outline" {...panels.outlineResize} />

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
              <EditorStepStrip step={editorStep} onStepChange={setEditorStep} />
            </Box>

            <ResizeHandle label="Resize inspector panel" controls="hud-editor-inspector" edge="end" {...panels.inspectorResize} />

            <Box id="hud-editor-inspector" className="hud-editor__rail" style={{ width: panels.inspectorWidth }}>
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
      </ScreenWindow>
    </Box>
    </MotionPreviewContext.Provider>
  );
};

export { HudLayoutEditor };
