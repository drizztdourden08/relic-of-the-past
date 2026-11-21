/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { useShadowScreenId } from '@app/shadow-editor';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import './ShadowEditorTools.css';

const ShadowEditorTools = () => {
  const t = useT();
  const { previewMode, setPreviewMode, debugMode, setDebugMode, dirty, save, undo, redo } = useShadowEditorStore();
  const screenId = useShadowScreenId();

  return (
    <Box className="shadow-editor-tools">
      {dirty && <Text className="shadow-editor-tools__dirty">●</Text>}
      <IconButton label={t('views-shadow-editor:tools.preview')} size="xs" onClick={() => setPreviewMode(!previewMode)} active={previewMode}><Icon name="eye" /></IconButton>
      <IconButton label={t('views-shadow-editor:tools.debug')} size="xs" onClick={() => setDebugMode(!debugMode)} active={debugMode}><Icon name="search" /></IconButton>
      <IconButton label={t('views-shadow-editor:tools.undo')} size="xs" onClick={() => undo(screenId)}>↶</IconButton>
      <IconButton label={t('views-shadow-editor:tools.redo')} size="xs" onClick={() => redo(screenId)}>↷</IconButton>
      <Button size="xs" variant="primary" onClick={() => void save()} disabled={!dirty}>{t('views-shadow-editor:tools.save')}</Button>
    </Box>
  );
};

export { ShadowEditorTools };
