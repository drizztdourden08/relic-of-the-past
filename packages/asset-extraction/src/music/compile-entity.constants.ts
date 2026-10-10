/* @layer shared-asset-extraction @kind constants */
import type { EntityFactories } from './compile-types.type';

const COMPILE_ENTITY_FACTORIES: EntityFactories = {
  Song: (name, ea, defined) => ({ type: 'Song', name, defined, ea, writeAddr: 0, phrases: [] }),
  Phrase: (name, ea, defined) => ({ type: 'Phrase', name, defined, ea, writeAddr: 0, patterns: [] }),
  Pattern: (name, ea, defined) => ({ type: 'Pattern', name, defined, ea, writeAddr: 0, lines: [], fallthrough: false }),
  SfxPattern: (name, ea, defined) => ({ type: 'SfxPattern', name, defined, ea, writeAddr: 0, lines: [] }),
  SongList: (name, ea, defined) => ({ type: 'SongList', name, defined, ea, writeAddr: 0, songs: [] }),
  SfxList: (name, ea, defined) => ({ type: 'SfxList', name, defined, ea, writeAddr: 0, patterns: [], next: [], echo: [] }),
};

export { COMPILE_ENTITY_FACTORIES };
