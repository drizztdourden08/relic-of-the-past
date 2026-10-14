/* @layer renderer-components @kind component */
import { Box, Icon } from '@drizztdourden08/tessera/primitives';
import { ScreenWindow, ResizeHandle } from '@drizztdourden08/tessera/composites';
import type { ScreenWindowHeader } from '@drizztdourden08/tessera/composites';
import { useReducedMotion } from '@app/compounds/HudNodeRenderer';
import { MotionPreviewContext, useMotionPreviewState } from '@app/hud-layout-editing/motion-preview';
import { usePanelResize } from '@app/hud-layout-editing/usePanelResize';
import { useHudLayoutEditor } from '@app/hud-layout-editing/useHudLayoutEditor';
import { EDITOR_GROUNDS } from './HudLayoutEditor.constants';
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

  const panels = usePanelResize();
  const motionPreview = useMotionPreviewState(useReducedMotion());

  return (
    <MotionPreviewContext.Provider value={motionPreview}>
      <Box className="hud-editor-portal">
        <ScreenWindow onClose={onClose} title="HUD Layout Editor" header={pageHeader}>
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

              <StageColumn editor={editor} />

              <ResizeHandle label="Resize inspector panel" controls="hud-editor-inspector" edge="end" {...panels.inspectorResize} />

              <Box id="hud-editor-inspector" className="hud-editor__rail" style={{ width: panels.inspectorWidth }}>
                <InspectorRail editor={editor} />
              </Box>
            </Box>
          </Box>
        </ScreenWindow>
      </Box>
    </MotionPreviewContext.Provider>
  );
};

export { HudLayoutEditor };
