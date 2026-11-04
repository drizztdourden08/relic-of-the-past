/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@rotp/game-core';
import { alttpMsuConfig, writeMsuResume as write } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const writeMsuResume = (profile: string, kind: SaveKind, id: string | number, state: MsuResumeState) =>
  write({ config: alttpMsuConfig, files: platformFiles(), slot: { profile, slotKind: kind, slotId: id }, state });

export { writeMsuResume };
