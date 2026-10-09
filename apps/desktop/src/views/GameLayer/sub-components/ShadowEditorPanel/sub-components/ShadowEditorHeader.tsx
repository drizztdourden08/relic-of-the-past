/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import { Box, Text, Button, IconButton } from '@drizztdourden08/tessera/primitives';
import type { ShadowEditorHeaderProps } from './ShadowEditorHeader.type';

const ShadowEditorHeader = ({ screenId, dirty }: ShadowEditorHeaderProps) => {
  const { previewMode, setPreviewMode, debugMode, setDebugMode, save, undo, redo } = useShadowEditorStore();
  const togglePreview = useCallback(() => setPreviewMode(!previewMode), [setPreviewMode, previewMode]);
  const toggleDebug = useCallback(() => setDebugMode(!debugMode), [setDebugMode, debugMode]);
  const handleUndo = useCallback(() => undo(screenId), [undo, screenId]);
  const handleRedo = useCallback(() => redo(screenId), [redo, screenId]);
  const handleSave = useCallback(() => save(), [save]);
  const handleClose = useCallback(() => useShadowEditorStore.getState().setOpen(false), []);

  return (
    <Box className="shadow-editor-panel__header">
      <Text className="shadow-editor-panel__title">
        Shadows
        {dirty && <Text className="shadow-editor-panel__dirty">●</Text>}
      </Text>
      <Box className="shadow-editor-panel__actions">
        <IconButton label="Preview" onClick={togglePreview} className={previewMode ? 'icon-btn--active' : ''}>👁</IconButton>
        <IconButton label="Debug" onClick={toggleDebug} className={debugMode ? 'icon-btn--active' : ''}>🔍</IconButton>
        <IconButton label="Undo" onClick={handleUndo}>↶</IconButton>
        <IconButton label="Redo" onClick={handleRedo}>↷</IconButton>
        <Button size="sm" variant="primary" onClick={handleSave} disabled={!dirty}>Save</Button>
        <IconButton label="Close" onClick={handleClose}>✕</IconButton>
      </Box>
    </Box>
  );
};

export { ShadowEditorHeader };
