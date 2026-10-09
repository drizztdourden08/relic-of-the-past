/* @layer shared-game @kind data */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type {
  ProgressiveFamilyDef, ProgressiveFamilyId, ProgressiveSetting, ProgressiveTierTicks,
} from './progressive.type';

const REPLACEMENT_ITEM: ItemId = ITEM.rupees20;

const OCARINA_DEFAULT_TICKS: ProgressiveTierTicks = [true, false];

const PROGRESSIVE_FAMILIES: readonly ProgressiveFamilyDef[] = [
  {
    id: 'sword',
    label: 'Sword',
    poolItem: ITEM.progressiveSword,
    tiers: [ITEM.fighterSword, ITEM.masterSword, ITEM.temperedSword, ITEM.goldenSword],
    tierLabels: ['Fighter', 'Master', 'Tempered', 'Golden'],
  },
  {
    id: 'shield',
    label: 'Shield',
    poolItem: ITEM.progressiveShield,
    tiers: [ITEM.blueShield, ITEM.redShield, ITEM.mirrorShield],
    tierLabels: ['Blue', 'Red', 'Mirror'],
  },
  {
    id: 'mail',
    label: 'Mail',
    poolItem: ITEM.progressiveMail,
    tiers: [ITEM.blueMail, ITEM.redMail],
    tierLabels: ['Blue', 'Red'],
  },
  {
    id: 'glove',
    label: 'Glove',
    poolItem: ITEM.progressiveGlove,
    tiers: [ITEM.powerGlove, ITEM.titansMitts],
    tierLabels: ['Lift', 'Heavy lift'],
  },
  {
    id: 'bow',
    label: 'Bow',
    poolItem: ITEM.progressiveBow,
    tiers: [ITEM.bow, ITEM.silverBow],
    tierLabels: ['Plain', 'Silver'],
  },
  {
    id: 'ocarina',
    label: 'Ocarina',
    poolItem: ITEM.progressiveOcarina,
    tiers: [ITEM.flute, ITEM.activatedFlute],
    tierLabels: ['Flute', 'Activated'],
    referenceCopies: 1,
    defaultTicks: OCARINA_DEFAULT_TICKS,
  },
];

const PROGRESSIVE_FAMILY_IDS: readonly ProgressiveFamilyId[] = ['sword', 'shield', 'mail', 'glove', 'bow', 'ocarina'];

const DEFAULT_PROGRESSIVE_SETTING: ProgressiveSetting = {
  sword: [true, true, true, true],
  shield: [true, true, true],
  mail: [true, true],
  glove: [true, true],
  bow: [true, true],
  ocarina: OCARINA_DEFAULT_TICKS,
};

export {
  DEFAULT_PROGRESSIVE_SETTING,
  PROGRESSIVE_FAMILIES,
  PROGRESSIVE_FAMILY_IDS,
  REPLACEMENT_ITEM,
};
