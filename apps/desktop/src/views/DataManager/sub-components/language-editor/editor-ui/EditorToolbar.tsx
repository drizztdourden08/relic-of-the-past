/* @layer renderer-components @kind component */
import { useCallback, useRef, useState } from 'react';
import listEndIcon from '@iconify-icons/lucide/list-end';
import redoIcon from '@iconify-icons/lucide/redo-2';
import settingsIcon from '@iconify-icons/lucide/sliders-horizontal';
import undoIcon from '@iconify-icons/lucide/undo-2';
import { Box, Divider } from '@drizztdourden08/tessera/primitives';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarInserts } from './ToolbarInserts';
import { hasOpenDropdown, SettingsPopover } from './popovers';
import { useDismissOnOutside } from './behavior/useDismissOnOutside';
import type { KeyboardEvent } from 'react';
import type { Token } from '@rotp/languages';
import { END_BOX, REDO, SETTINGS, SETTINGS_LABEL, UNDO } from './EditorToolbar.constants';
import type { EditorToolbarProps } from './EditorToolbar.type';
import './EditorToolbar.css';

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    cfg, variables, font, settingsTokens, structureMode, canUndo, canRedo, disabled = false,
    onUndo, onRedo, onInsert, onEndBox, onChangeSettings, onChangeStructureMode,
  } = props;

  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const handleDismiss = useCallback(() => {
    if (hasOpenDropdown()) return;
    setOpen(null);
  }, []);
  useDismissOnOutside(rootRef, open !== null, handleDismiss);

  const handlePress = useCallback((id: string) => {
    if (id === UNDO) return onUndo();
    if (id === REDO) return onRedo();
    if (id === END_BOX) return onEndBox();
    return setOpen((current) => (current === id ? null : id));
  }, [onUndo, onRedo, onEndBox]);

  const handleInsert = useCallback((tokens: Token[]) => {
    setOpen(null);
    onInsert(tokens);
  }, [onInsert]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setOpen(null);
  }, []);

  return (
    <Box
      ref={rootRef}
      className="editor-toolbar"
      role="toolbar"
      aria-label="Editing actions"
      onKeyDown={handleKeyDown}
    >
      <ToolbarButton
        id={UNDO}
        icon={undoIcon}
        label="Undo"
        disabled={disabled || !canUndo}
        onPress={handlePress}
      />
      <ToolbarButton
        id={REDO}
        icon={redoIcon}
        label="Redo"
        disabled={disabled || !canRedo}
        onPress={handlePress}
      />

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

      <ToolbarButton
        id={END_BOX}
        icon={listEndIcon}
        label="End the box here"
        disabled={disabled}
        onPress={handlePress}
      />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarButton
        id={SETTINGS}
        icon={settingsIcon}
        label={SETTINGS_LABEL}
        disabled={disabled}
        open={open === SETTINGS}
        popover={(
          <SettingsPopover
            label={SETTINGS_LABEL}
            cfg={cfg}
            tokens={settingsTokens}
            structureMode={structureMode}
            onChangeSettings={onChangeSettings}
            onChangeStructureMode={onChangeStructureMode}
          />
        )}
        onPress={handlePress}
      />
    </Box>
  );
};

export { EditorToolbar };
