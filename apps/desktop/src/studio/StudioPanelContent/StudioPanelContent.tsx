/* @layer renderer-components @kind component */
import { DensityScope } from '@drizztdourden08/tessera/primitives';
import type { StudioPanelContentProps } from './StudioPanelContent.type';

const StudioPanelContent = ({ children }: StudioPanelContentProps) => (
  <DensityScope density="compact">{children}</DensityScope>
);

export { StudioPanelContent };
