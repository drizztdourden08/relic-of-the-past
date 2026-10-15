/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { EditorStepContext } from '@app/hud-layout-editing/editor-step';
import { GridSolveContext } from '@app/hud-layout-editing/grid-solve';
import { SlotSchemeContext } from '@app/hud-layout-editing/slot-scheme';
import { FlexSlotContext } from '@app/hud-layout-editing/flex-slots';
import { GlyphPackPicker } from './GlyphPackPicker';
import { NodeInspector } from './NodeInspector';
import { PresetBar } from './PresetBar';
import type { InspectorRailProps } from './InspectorRail.type';

const InspectorRail = (props: InspectorRailProps) => {
  const { editor } = props;
  const {
    glyphs, draft, edits, layout, packId, sample, gridSolve, flexSlots, positions,
    createPack, deletePack, selected, validation,
  } = editor;
  const editorStep = useHudEditorViewStore((s) => s.editorStep);

  return (
    <>
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
    </>
  );
};

export { InspectorRail };
