/* @layer renderer-stores @kind logic */
import { useGameUIStore } from '../game-ui-store';
import { syncFromGame } from './sync-from-game';

useGameUIStore.subscribe(syncFromGame);
