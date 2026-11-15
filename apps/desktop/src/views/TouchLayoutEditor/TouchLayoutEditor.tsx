/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { EDITOR_MIN_STRENGTH } from './TouchLayoutEditor.constants';
import { useEditorActions } from './behavior/useEditorActions';
import { useEditorDraft } from './behavior/useEditorDraft';
import { useEditorDrag } from './behavior/useEditorDrag';
import { TouchEditBar } from './sub-components/TouchEditBar';
import { TouchEditorCards } from './sub-components/TouchEditorCards';
import { TouchEditorGrid } from './sub-components/TouchEditorGrid';
import { TouchEditorHitAreas } from './sub-components/TouchEditorHitAreas';
import { TouchEditorVisuals } from './sub-components/TouchEditorVisuals';
import './TouchLayoutEditor.css';
import type { TouchLayoutEditorProps } from './TouchLayoutEditor.type';

const TouchLayoutEditor = (props: TouchLayoutEditorProps) => {
  const { layout, orientation, box, touch, onSave, onClose } = props;
  const editor = useEditorDraft({ layout, orientation, touch });
  const { draft, setDraft, shared, selection, setSelection } = editor;
  const drag = useEditorDrag({ layout: draft, box, snap: shared.snap, onLayout: setDraft });
  const actions = useEditorActions({ layout: draft, box, onLayout: setDraft, onSelect: setSelection });
  const strength = Math.max(EDITOR_MIN_STRENGTH, shared.buttonStrength);

  return (
    <Box className="touch-layout-editor" onPointerDown={() => setSelection(null)}>
      <TouchEditorGrid box={box} snap={shared.snap} guides={drag.guides} />
      <TouchEditorVisuals layout={draft} box={box} strength={strength} selection={selection} />
      <TouchEditorHitAreas layout={draft} box={box} drag={drag} onSelect={setSelection} />
      <TouchEditBar
        orientation={orientation}
        onAdd={() => setSelection({ kind: 'add' })}
        onLayer={() => setSelection({ kind: 'layer' })}
        onCancel={onClose}
        onDone={() => onSave(draft, editor.sharedPatch())}
      />
      <TouchEditorCards
        selection={selection}
        layout={draft}
        orientation={orientation}
        box={box}
        shared={shared}
        actions={actions}
        onShared={editor.patchShared}
        onReset={editor.resetLayout}
      />
    </Box>
  );
};

export { TouchLayoutEditor };
