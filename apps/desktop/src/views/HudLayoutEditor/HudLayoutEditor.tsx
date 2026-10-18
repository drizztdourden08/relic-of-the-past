/* @layer renderer-components @kind component */
import { Box, DensityScope, Icon } from '@drizztdourden08/tessera/primitives';
import { ScreenWindow, SidePanel } from '@drizztdourden08/tessera/composites';
import type { ScreenWindowHeader } from '@drizztdourden08/tessera/composites';
import { useReducedMotion } from '@app/compounds/HudNodeRenderer';
import { MotionPreviewContext, useMotionPreviewState } from '@app/hud-layout-editing/motion-preview';
import { useHudLayoutEditor } from '@app/hud-layout-editing/useHudLayoutEditor';
import { EDITOR_GROUNDS, INSPECTOR_PANEL, OUTLINE_PANEL } from './HudLayoutEditor.constants';
import { EditorToolbar } from './sub-components/EditorToolbar';
import { InspectorRail } from './sub-components/InspectorRail';
import { OutlinePanel } from './sub-components/OutlinePanel';
import { StageColumn } from './sub-components/StageColumn';
import './HudLayoutEditor.css';
import type { HudLayoutEditorProps } from './HudLayoutEditor.type';

const pageHeader: ScreenWindowHeader = { icon: <Icon name="layout-list" /> };

const HudLayoutEditor = (props: HudLayoutEditorProps) => {
  const { onClose } = props;
  const editor = useHudLayoutEditor(props);
  const { glyphs, draft, edits, setRatioId, ground, setGround, layout, ratio, slots, target } = editor;

  const motionPreview = useMotionPreviewState(useReducedMotion());

  return (
    <MotionPreviewContext.Provider value={motionPreview}>
      <Box className="hud-editor-portal">
        <ScreenWindow onClose={onClose} title="HUD Layout Editor" header={pageHeader}>
          <DensityScope density="compact">
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
                <SidePanel {...OUTLINE_PANEL}>
                  <OutlinePanel
                    doc={layout}
                    selectedId={edits.selectedId}
                    slotNumbers={slots.map((slot) => slot.index)}
                    onSelect={edits.select}
                    onRemove={edits.remove}
                    onDrop={edits.drop}
                  />
                </SidePanel>

                <StageColumn editor={editor} />

                <SidePanel side="end" {...INSPECTOR_PANEL}>
                  <InspectorRail editor={editor} />
                </SidePanel>
              </Box>
            </Box>
          </DensityScope>
        </ScreenWindow>
      </Box>
    </MotionPreviewContext.Provider>
  );
};

export { HudLayoutEditor };
