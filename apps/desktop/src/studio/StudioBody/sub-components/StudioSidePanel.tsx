/* @layer renderer-components @kind component */
import { DensityScope } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import type { StudioSidePanelProps } from '../StudioBody.type';

const StudioSidePanel = (props: StudioSidePanelProps) => {
  const { side, panel } = props;
  const { title, storageKey, width, minWidth, maxWidth, content } = panel;

  return (
    <SidePanel side={side} title={title} storageKey={storageKey} width={width} minWidth={minWidth} maxWidth={maxWidth}>
      <DensityScope density="compact">{content}</DensityScope>
    </SidePanel>
  );
};

export { StudioSidePanel };
