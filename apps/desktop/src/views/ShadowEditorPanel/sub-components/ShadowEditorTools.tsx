/* @layer renderer-components @kind component */
import { Box, Button, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { useShadowScreenId } from '@app/shadow-editor';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import './ShadowEditorTools.css';

const ShadowEditorTools = () => {
  const { previewMode, setPreviewMode, debugMode, setDebugMode, dirty, save, undo, redo } = useShadowEditorStore();
  const screenId = useShadowScreenId();

  return (
    <Box className="shadow-editor-tools">
      {dirty && <Text className="shadow-editor-tools__dirty">●</Text>}
      <IconButton label="Preview" size="xs" onClick={() => setPreviewMode(!previewMode)} active={previewMode}><Icon name="eye" /></IconButton>
      <IconButton label="Debug" size="xs" onClick={() => setDebugMode(!debugMode)} active={debugMode}><Icon name="search" /></IconButton>
      <IconButton label="Undo" size="xs" onClick={() => undo(screenId)}>↶</IconButton>
      <IconButton label="Redo" size="xs" onClick={() => redo(screenId)}>↷</IconButton>
      <Button size="xs" variant="primary" onClick={() => void save()} disabled={!dirty}>Save</Button>
    </Box>
  );
};

export { ShadowEditorTools };
