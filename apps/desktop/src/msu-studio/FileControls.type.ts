/* @layer renderer-components @kind types */
import type { useFilePanel } from './behavior/useFilePanel';
import type { useSupersededFiles } from './behavior/useSupersededFiles';

type FileControlsProps = {
  panel: ReturnType<typeof useFilePanel>;
  coveredCount: ReturnType<typeof useSupersededFiles>['count'];
  supersededOnly: boolean;
  readOnly: boolean;
  onSupersededOnlyChange: (checked: boolean) => void;
};

export type { FileControlsProps };
