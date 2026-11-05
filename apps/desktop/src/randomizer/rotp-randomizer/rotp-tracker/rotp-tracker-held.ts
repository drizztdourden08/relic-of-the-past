/* @layer renderer-app @kind logic */
import { getCurrentInventory } from '@app/game/tracker';

const rotpHeld = (): readonly string[] => [...getCurrentInventory()];

export { rotpHeld };
