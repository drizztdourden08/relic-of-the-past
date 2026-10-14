/* @layer renderer-components @kind types */
import type { IconName } from '@drizztdourden08/tessera/primitives';

interface NodeArt {
  src?: string;
  icon: IconName;
  name: string;
}

interface FaceArt {
  src: string | undefined;
  name: string;
  kind: string | undefined;
}

export type { FaceArt, NodeArt };
