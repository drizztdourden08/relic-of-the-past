/* @layer bridge-wasm @kind logic */
import type { GearTiers } from './gear-ownership.type';

const raiseTiers = (a: GearTiers, b: GearTiers): GearTiers => ({
  sword: Math.max(a.sword, b.sword),
  shield: Math.max(a.shield, b.shield),
  mail: Math.max(a.mail, b.mail),
  bow: Math.max(a.bow, b.bow),
});

export { raiseTiers };
