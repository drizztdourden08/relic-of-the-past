/* @layer renderer-components @kind component */
import { Box, DensityScope } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { useReducedMotion } from '@app/compounds/HudNodeRenderer';
import { MotionPreviewContext, useMotionPreviewState } from '@app/hud-layout-editing/motion-preview';
import { useHudLayoutEditor } from '@app/hud-layout-editing/useHudLayoutEditor';
import { targetLabel } from '@app/hud-layout-editing/node-name';
import { EDITOR_GROUNDS, INSPECTOR_PANEL, OUTLINE_PANEL } from './HudLayoutEditor.constants';
import { EditorToolbar } from './sub-components/EditorToolbar';
import { InspectorRail } from './sub-components/InspectorRail';
import { OutlinePanel } from './sub-components/OutlinePanel';
import { StageColumn } from './sub-components/StageColumn';
import './HudLayoutEditor.css';
import type { HudLayoutEditorProps } from './HudLayoutEditor.type';
import { useT } from '@drizztdourden08/brock-react';

const HudLayoutEditor = (props: HudLayoutEditorProps) => {
  const t = useT();
  const editor = useHudLayoutEditor(props);
  const { glyphs, draft, edits, setRatioId, ground, setGround, layout, ratio, slots, target } = editor;

  const motionPreview = useMotionPreviewState(useReducedMotion());

  return (
    <MotionPreviewContext.Provider value={motionPreview}>
      <Box className="hud-editor-portal">
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
                targetLabel={targetLabel(target, layout.screen.id, t)}
              />

              <Box className="hud-editor__body">
                <SidePanel
                  {...OUTLINE_PANEL}
                  title={t('hud-editor:panel.outline')}
                  containers={[{
                    title: t('hud-editor:panel.layers'),
                    content: (
                      <OutlinePanel
                        doc={layout}
                        selectedId={edits.selectedId}
                        slotNumbers={slots.map((slot) => slot.index)}
                        onSelect={edits.select}
                        onRemove={edits.remove}
                        onDrop={edits.drop}
                      />
                    ),
                  }]}
                />

                <StageColumn editor={editor} />

                <SidePanel
                  side="end"
                  {...INSPECTOR_PANEL}
                  title={t('hud-editor:panel.inspector')}
                  containers={[{
                    title: t('hud-editor:panel.selected'),
                    content: <InspectorRail editor={editor} />,
                  }]}
                />
              </Box>
            </Box>
        </DensityScope>
      </Box>
    </MotionPreviewContext.Provider>
  );
};

export { HudLayoutEditor };
