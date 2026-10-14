/* @layer renderer-lib @kind logic */
import { MAIN_ROM_KIND, createRomStore } from '@drizztdourden08/brock-port-kit';
import type { RomKindStore } from '@drizztdourden08/brock-port-kit';
import type { FileStore } from '@drizztdourden08/brock-core';
import type { RomKind } from '@rotp/roms';
import { rotpPort } from '@app/game/port';

const romStoreOf = (files: FileStore, kind: RomKind): RomKindStore =>
  createRomStore(files, rotpPort).of(kind === 'snes-alttp' ? MAIN_ROM_KIND : kind);

export { romStoreOf };
