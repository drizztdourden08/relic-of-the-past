/* @layer renderer-lib @kind logic */
import type { SaveKind } from '@rotp/game-core';
import { resume } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  resume.deleteMsuResume(platformFiles(), profile, kind, id);

export { deleteMsuResume };
