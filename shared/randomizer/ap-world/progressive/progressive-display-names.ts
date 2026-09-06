/* @layer shared-game @kind logic */
/**
 * What the tier controls and the tier rows are LABELLED with.
 *
 * The family table carries two things per rung: the identity the generator
 * places (`tiers`, the reference project's own item name) and a short neutral
 * word for the box (`tierLabels`). The neutral word was there because the code
 * around it may not spell the game's terms; the terms themselves are data, and
 * the record set already transcribes them. So the label asks the dictionary
 * for the identity and keeps the neutral word only when the dataset is not on
 * disk (display-names/), which is exactly the reading a checkout without the
 * private dataset gets.
 */
import { itemDisplayName } from '../display-names/item-display-name';
import { familyOfId } from './progressive-families.data';
import type { ProgressiveFamilyDef, ProgressiveFamilyId } from './progressive.type';

/** The family's own heading: its pool item's real name, else the neutral word. */
const progressiveFamilyName = (family: ProgressiveFamilyDef): string =>
  itemDisplayName(family.poolItem, family.label);

/** One rung's label: the tier's real name, else the short neutral word. */
const progressiveTierName = (family: ProgressiveFamilyDef, index: number): string =>
  itemDisplayName(family.tiers[index] ?? '', family.tierLabels[index] ?? String(index + 1));

const progressiveFamilyNameOf = (id: ProgressiveFamilyId): string =>
  progressiveFamilyName(familyOfId(id));

const progressiveTierNameOf = (id: ProgressiveFamilyId, index: number): string =>
  progressiveTierName(familyOfId(id), index);

export {
  progressiveFamilyName, progressiveFamilyNameOf, progressiveTierName, progressiveTierNameOf,
};
