/* @layer renderer-components @kind logic */
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';

const chosenStatus = (file: File | null): DropZoneStatus | undefined =>
  (file === null ? undefined : { tone: 'success', message: file.name });

export { chosenStatus };
