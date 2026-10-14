/* @layer shared-storage @kind types */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@rotp/game-core';

interface WriteMsuResumeParams {
  files: FileStore;
  profile: string;
  kind: SaveKind;
  id: string | number;
  state: MsuResumeState;
}

export type { WriteMsuResumeParams };
