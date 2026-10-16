/* @layer renderer-lib @kind logic */
import { createSaveStore } from '@drizztdourden08/brock-port-kit';
import type { SaveSlotRef, SaveStore } from '@drizztdourden08/brock-port-kit';
import type { FileStore } from '@drizztdourden08/brock-core';
import { kindDir, msuSidecarPath, saveStem } from '@rotp/game-core/save-paths';
import { manifestCodecFiles } from './manifest-codec/manifest-codec-files';

const msuSidecarOf = (profileId: string, ref: SaveSlotRef): string[] =>
  [msuSidecarPath(kindDir(profileId, ref.kind), ref.kind === 'quick' ? saveStem('quick', ref.slot) : saveStem(ref.kind, ref.id))];

const createRotpSaveStore = (files: FileStore): SaveStore =>
  createSaveStore(manifestCodecFiles(files), { companions: msuSidecarOf });

export { createRotpSaveStore };
