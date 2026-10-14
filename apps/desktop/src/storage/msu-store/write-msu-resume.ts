/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@rotp/game-core';
import { resume } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const writeMsuResume = (profile: string, kind: SaveKind, id: string | number, state: MsuResumeState) =>
  resume.writeMsuResume({ files: platformFiles(), profile, kind, id, state });

export { writeMsuResume };
