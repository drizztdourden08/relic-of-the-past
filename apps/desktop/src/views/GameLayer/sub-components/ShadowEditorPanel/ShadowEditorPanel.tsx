/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import type { EditorTool } from '../../../../stores/shadow-editor-store';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { wasmGetViewportInfo } from '../../../../game';
import { overworldScreenIdOf } from '../../behavior/overworld-screen-id';
import { ShadowEditorHeader } from './sub-components/ShadowEditorHeader';
import { ShadowInspector } from './sub-components/ShadowInspector';
import { ShadowToolOptions } from './sub-components/ShadowToolOptions';
import { TOOL_OPTIONS } from './ShadowEditorPanel.constants';
import './ShadowEditorPanel.css';

const currentScreenId = (): number => {
  const vp = wasmGetViewportInfo();
  return vp ? overworldScreenIdOf(vp) : 0;
};

const ShadowEditorPanel = () => {
  const {
    open,
    activeTool,
    setActiveTool,
    selectedElementId,
    selectedType,
    dirty,
    getScreenData,
    removeHeightmapElement,
    removeLight,
  } = useShadowEditorStore();

  const screenId = currentScreenId();
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

  if (!open) return null;

  return (
    <Box className="shadow-editor-panel">
      <ShadowEditorHeader screenId={screenId} dirty={dirty} />

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
