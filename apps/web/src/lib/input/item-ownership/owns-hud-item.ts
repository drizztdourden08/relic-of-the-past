/* @layer renderer-lib @kind logic */
import { ownedHudItems } from './owned-hud-items';

const ownsHudItem = (hudItem: number): boolean => ownedHudItems()[hudItem - 1] === true;

export { ownsHudItem };
