/* @layer renderer-lib @kind logic */
import type { SaveKind } from '@rotp/game-core';
import { alttpMsuConfig, readMsuResume as read } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuResume = (profile: string, kind: SaveKind, id: string | number) =>
  read(alttpMsuConfig, platformFiles(), { profile, slotKind: kind, slotId: id });

export { readMsuResume };
