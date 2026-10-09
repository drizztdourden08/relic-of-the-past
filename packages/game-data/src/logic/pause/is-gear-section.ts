/* @layer shared-game @kind logic */
import type { GearLadderKind, PauseSection } from './pause.type';
import { GEAR_LADDER_KINDS } from './gear-tiers.constants';

const isGearSection = (section: PauseSection): section is GearLadderKind =>
  (GEAR_LADDER_KINDS as readonly PauseSection[]).includes(section);

export { isGearSection };
