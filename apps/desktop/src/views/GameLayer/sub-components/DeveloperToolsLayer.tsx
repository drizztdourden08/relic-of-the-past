/* @layer renderer-components @kind component */
import type { DeveloperToolsLayerProps } from './DeveloperToolsLayer.type';
import { ShadowEditorOverlay } from './ShadowEditorOverlay';
import { ShadowEditorPanel } from './ShadowEditorPanel';
import { ShadowElementList } from './ShadowElementList';

const DeveloperToolsLayer = (props: DeveloperToolsLayerProps) => {
  const { width, height } = props;
  return (
    <>
      <ShadowEditorOverlay width={width} height={height} gameRunning />
      <ShadowEditorPanel />
      <ShadowElementList />
    </>
  );
};

export { DeveloperToolsLayer };
