/* @layer renderer-stores @kind logic */
import { useGameUIStore } from '../game-ui-store';
import { syncFromGame } from './syncFromGame';

useGameUIStore.subscribe(syncFromGame);
