/* @layer renderer-components @kind component */
import listEndIcon from '@iconify-icons/lucide/list-end';
import redoIcon from '@iconify-icons/lucide/redo-2';
import undoIcon from '@iconify-icons/lucide/undo-2';
import { Box, Divider } from '@drizztdourden08/tessera/primitives';
import { useToolbarState } from './behavior/useToolbarState';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarInserts } from './ToolbarInserts';
import { ToolbarSettings } from './ToolbarSettings';
import { END_BOX, REDO, SETTINGS, UNDO } from './EditorToolbar.constants';
import type { EditorToolbarProps } from './EditorToolbar.type';
import './EditorToolbar.css';

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    cfg, variables, font, settingsTokens, structureMode, canUndo, canRedo, disabled = false,
    onUndo, onRedo, onInsert, onEndBox, onChangeSettings, onChangeStructureMode,
  } = props;
  const { rootRef, open, handlePress, handleInsert, handleKeyDown } = useToolbarState({ onUndo, onRedo, onEndBox, onInsert });

  return (
    <Box
      ref={rootRef}
      className="editor-toolbar"
      role="toolbar"
      aria-label="Editing actions"
      onKeyDown={handleKeyDown}
    >
      <ToolbarButton id={UNDO} icon={undoIcon} label="Undo" disabled={disabled || !canUndo} onPress={handlePress} />
      <ToolbarButton id={REDO} icon={redoIcon} label="Redo" disabled={disabled || !canRedo} onPress={handlePress} />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarInserts
        cfg={cfg}
        variables={variables}
        font={font}
        disabled={disabled}
        open={open}
        onPress={handlePress}
        onInsert={handleInsert}
      />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarButton id={END_BOX} icon={listEndIcon} label="End the box here" disabled={disabled} onPress={handlePress} />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarSettings
        cfg={cfg}
        settingsTokens={settingsTokens}
        structureMode={structureMode}
        disabled={disabled}
        open={open === SETTINGS}
        onPress={handlePress}
        onChangeSettings={onChangeSettings}
        onChangeStructureMode={onChangeStructureMode}
      />
    </Box>
  );
};

export { EditorToolbar };
