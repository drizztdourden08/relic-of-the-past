/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../../../../stores/shadow-editor-store';
import type { EditorTool } from '../../../../../../../stores/shadow-editor-store';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ShadowShapeInspector } from '../shadow-editor/ShadowShapeInspector';
import { ShadowLightInspector } from '../shadow-editor/ShadowLightInspector';
import { ShadowGlobalSettings } from '../shadow-editor/ShadowGlobalSettings';
import { wasmGetViewportInfo } from '../../../../../../../lib/game';
import { overworldScreenIdOf } from '../../behavior/overworld-screen-id';
import { ShadowEditorHeader } from './sub-components/ShadowEditorHeader';
import { ShapeToolOptions } from './sub-components/ShapeToolOptions';
import { LightToolOptions } from './sub-components/LightToolOptions';
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
    updateHeightmapElement,
    updateLight,
    updateLighting,
    removeHeightmapElement,
    removeLight,
  } = useShadowEditorStore();

  const screenId = currentScreenId();
  const screenData = getScreenData(screenId);

  const selectedHm = selectedType === 'heightmap' ? screenData.heightmap.find((e) => e.id === selectedElementId) : null;
  const selectedLight = selectedType === 'light' ? screenData.lights.find((l) => l.id === selectedElementId) : null;
  const hasSelection = selectedHm || selectedLight;

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

      {(activeTool === 'polygon' || activeTool === 'shape-light') && !hasSelection && <ShapeToolOptions />}
      {(activeTool === 'point-light') && !hasSelection && <LightToolOptions />}

      <Box className="shadow-editor-panel__body">
        {selectedHm && (
          <ShadowShapeInspector screenId={screenId} selectedHm={selectedHm} updateHeightmapElement={updateHeightmapElement} handleDelete={handleDelete} />
        )}
        {selectedLight && (
          <ShadowLightInspector screenId={screenId} selectedLight={selectedLight} updateLight={updateLight} handleDelete={handleDelete} />
        )}
        {!hasSelection && (
          <ShadowGlobalSettings screenId={screenId} screenData={screenData} updateLighting={updateLighting} />
        )}
      </Box>

      <Box className="shadow-editor-panel__footer">
        Screen #{screenId} · {screenData.heightmap.length} shapes · {screenData.lights.length} lights
      </Box>
    </Box>
  );
};

export { ShadowEditorPanel };
