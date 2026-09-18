/* @layer shared-game @kind logic */
/**
 * The words the vanilla rules are written in: one requirement per item or story fact the
 * reference randomizer names, plus `all` and `any` to join them. Item ids are the dataset's
 * (records/items); the story facts are the tracker's own checks.
 */
import type { CheckId, ItemId, Requirement } from '@shared/game/data/types';
import {
  canActivateCrystalSwitch, canKillMostThings, canLiftRocks, canMeltThings, hasBeamSword, hasCrystals, hasFireSource,
  hasMeleeWeapon, hasSword,
} from '@shared/game/data/requirements/helpers';

const item = (id: string): Requirement => ({ itemId: id as ItemId });
const check = (id: string): Requirement => ({ checkId: id as CheckId });

const R = {
  all: (...parts: Requirement[]): Requirement => ({ allOf: parts }),
  any: (...parts: Requirement[]): Requirement => ({ anyOf: parts }),
  never: { impossible: true } as Requirement,
  // Items.
  bombs: item('item-041'),
  boots: item('item-076'),
  bombsOrBoots: { anyOf: [item('item-041'), item('item-076')] } as Requirement,
  book: item('item-030'),
  bow: item('item-012'),
  byrna: item('item-025'),
  cape: item('item-026'),
  ether: item('item-017'),
  fireRod: item('item-008'),
  flippers: item('item-031'),
  flute: item('item-021'),
  activatedFlute: item('item-075'),
  gloves: canLiftRocks,
  hammer: item('item-010'),
  hookshot: item('item-011'),
  iceRod: item('item-009'),
  lamp: item('item-019'),
  mirror: item('item-027'),
  mitt: item('item-029'),
  mushroom: item('item-042'),
  net: item('item-034'),
  pearl: item('item-032'),
  powder: item('item-014'),
  quake: item('item-018'),
  shovel: item('item-020'),
  somaria: item('item-022'),
  bottle: item('item-023'),
  silverBow: { anyOf: [item('item-060'), { allOf: [item('item-012'), item('item-078')] }] } as Requirement,
  greenPendant: item('item-109'),
  crystal5: item('item-116'),
  crystal6: item('item-117'),
  crystals7: hasCrystals(7),
  sword: hasSword,
  beamSword: hasBeamSword,
  melee: hasMeleeWeapon,
  fireSource: hasFireSource,
  melt: canMeltThings,
  kill: canKillMostThings,
  hitSwitch: canActivateCrystalSwitch,
  bigKey: (id: string): Requirement => item(id),
  // Story facts, as the tracker's own checks.
  uncleMet: check('check-002'),
  princessSafe: check('check-004'),
  agahnim1: check('check-098'),
  agahnim2: check('check-099'),
  frogFound: check('check-335'),
  smithsReunited: check('check-336'),
  purpleChestFound: check('check-337'),
  floodgate: check('check-326'),
  pendants3: { count: { groupId: 'ig-004', n: 3 } } as Requirement,
} as const;

export { R };
