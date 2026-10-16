/* @layer renderer-components @kind component */
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { ShadowGlobalSettings } from './ShadowGlobalSettings';
import { ShadowLightInspector } from './ShadowLightInspector';
import { ShadowShapeInspector } from './ShadowShapeInspector';
import type { ShadowInspectorProps } from './ShadowInspector.type';

const ShadowInspector = ({ screenId, screenData, selectedHm, selectedLight, handleDelete }: ShadowInspectorProps) => {
  const { updateHeightmapElement, updateLight, updateLighting } = useShadowEditorStore();

  if (selectedHm) {
    return <ShadowShapeInspector screenId={screenId} selectedHm={selectedHm} updateHeightmapElement={updateHeightmapElement} handleDelete={handleDelete} />;
  }
  if (selectedLight) {
    return <ShadowLightInspector screenId={screenId} selectedLight={selectedLight} updateLight={updateLight} handleDelete={handleDelete} />;
  }
  return <ShadowGlobalSettings screenId={screenId} screenData={screenData} updateLighting={updateLighting} />;
};

export { ShadowInspector };
