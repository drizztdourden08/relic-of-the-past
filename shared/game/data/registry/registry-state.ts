/* @layer shared-game @kind logic */
import type { RegistryState } from './registry.type';

const registryState: RegistryState = {
  store: {
    screen: new Map(), connection: new Map(), check: new Map(), item: new Map(),
    dungeon: new Map(), area: new Map(), location: new Map(), region: new Map(),
    actor: new Map(), tag: new Map(), 'item-group': new Map(), enumeration: new Map(),
  },
};

export { registryState };
