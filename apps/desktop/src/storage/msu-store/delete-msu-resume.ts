/* @layer renderer-lib @kind logic */
import type { SaveKind } from '@rotp/game-core';
import { alttpMsuConfig, deleteMsuResume as remove } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  remove(alttpMsuConfig, platformFiles(), { profile, slotKind: kind, slotId: id });

export { deleteMsuResume };
