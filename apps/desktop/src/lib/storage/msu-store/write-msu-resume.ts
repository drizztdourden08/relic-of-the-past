/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@shared/storage/save-paths';
import * as resume from '@shared/storage/msu-resume';
import { platformFiles } from '../platform-files';

const writeMsuResume = (profile: string, kind: SaveKind, id: string | number, state: MsuResumeState) =>
  resume.writeMsuResume(platformFiles(), profile, kind, id, state);

export { writeMsuResume };
