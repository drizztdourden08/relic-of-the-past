/* @layer renderer-components @kind types */
import type { SelectOption } from '@drizztdourden08/tessera/primitives';

type TrackFileFieldProps = {
  trackNum: number;
  fileName: string | null;
  fileSize?: number;
  options: SelectOption[];
  busy: boolean;
  readOnly: boolean;
  onAssign: (trackNum: number, fileName: string) => void;
};

export type { TrackFileFieldProps };
