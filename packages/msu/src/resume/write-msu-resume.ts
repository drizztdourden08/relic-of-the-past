/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@rotp/game-core';
import { resumePath } from './resume-path';

const writeMsuResume = (files: FileStore, profile: string, kind: SaveKind, id: string | number,
  state: MsuResumeState): Promise<void> =>
  files.writeText(resumePath(profile, kind, id), `${JSON.stringify(state, null, 2)}\n`);

export { writeMsuResume };
