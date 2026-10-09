/* @layer shared-game @kind logic */
import { all } from '../registry';
import { rebuildActorIndex } from './actor';
import { rebuildCheckIndex } from './check';
import { rebuildDungeonIndex } from './dungeon';
import { rebuildItemIndex } from './item';
import { rebuildScreenIndex } from './screen';

const rebuild = (): void => {
  rebuildScreenIndex(all('screen'));
  rebuildCheckIndex(all('check'));
  rebuildItemIndex(all('item'));
  rebuildActorIndex(all('actor'));
  rebuildDungeonIndex(all('dungeon'));
};

export { rebuild };
