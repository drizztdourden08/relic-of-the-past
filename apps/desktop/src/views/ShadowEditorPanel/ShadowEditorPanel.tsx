/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { useEnsureShadowProject, useShadowScreenId } from '@app/shadow-editor';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import type { EditorTool } from '@app/stores/shadow-editor-store';
import { ShadowInspector } from './sub-components/ShadowInspector';
import { ShadowToolOptions } from './sub-components/ShadowToolOptions';
import { TOOL_OPTIONS } from './ShadowEditorPanel.constants';
import './ShadowEditorPanel.css';

const ShadowEditorPanel = () => {
  const {
    activeTool,
    setActiveTool,
    selectedElementId,
    selectedType,
    getScreenData,
    removeHeightmapElement,
    removeLight,
  } = useShadowEditorStore();

  useEnsureShadowProject();
  const screenId = useShadowScreenId();
  const screenData = getScreenData(screenId);

  const selectedHm = selectedType === 'heightmap' ? screenData.heightmap.find((e) => e.id === selectedElementId) : null;
  const selectedLight = selectedType === 'light' ? screenData.lights.find((l) => l.id === selectedElementId) : null;
  const hasSelection = Boolean(selectedHm ?? selectedLight);

  const handleDelete = useCallback(() => {
    if (!selectedElementId) return;
    if (selectedType === 'heightmap') removeHeightmapElement(screenId, selectedElementId);
    if (selectedType === 'light') removeLight(screenId, selectedElementId);
  }, [selectedElementId, selectedType, screenId, removeHeightmapElement, removeLight]);
  const handleToolChange = useCallback((v: string) => setActiveTool(v as EditorTool), [setActiveTool]);

  return (
    <Box className="shadow-editor-panel">
      <Box className="shadow-editor-panel__toolbar">
        <SegmentedControl value={activeTool} options={TOOL_OPTIONS} onChange={handleToolChange} />
      </Box>

      <ShadowToolOptions activeTool={activeTool} hasSelection={hasSelection} />

      <Box className="shadow-editor-panel__body">
        <ShadowInspector
          screenId={screenId}
          screenData={screenData}
          selectedHm={selectedHm}
          selectedLight={selectedLight}
          handleDelete={handleDelete}
        />
      </Box>

      <Box className="shadow-editor-panel__footer">
        Screen #{screenId} · {screenData.heightmap.length} shapes · {screenData.lights.length} lights
      </Box>
    </Box>
  );
};

export { ShadowEditorPanel };
