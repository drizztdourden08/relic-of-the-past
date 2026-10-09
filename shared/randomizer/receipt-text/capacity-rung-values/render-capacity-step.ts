/* @layer shared-game @kind logic */
import { CAPACITY_RECEIPT_LABELS } from '@shared/game/data/capacity-upgrade-names.data';
import { primary } from '../highlight-markup';
import { detailPage } from '../receipt-line.type';
import { capacityRungText } from './capacity-rung-text';
import { VALUE_UNIT } from './capacity-rung-values.constants';
import { growthVerb } from './growth-verb';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
import type { ReceiptLine } from '../receipt-line.type';

const capacityTierText = (tiers: number): string => `${tiers} tier${tiers === 1 ? '' : 's'}`;

const ownedLabel = (family: CapacityFamilyId): string => {
  const label = CAPACITY_RECEIPT_LABELS[family];
  return `Your ${primary(`${label.charAt(0).toLowerCase()}${label.slice(1)}`)}`;
};

const sentenceText = (family: CapacityFamilyId, rung: number): string => {
  const text = capacityRungText(family, rung);
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

const ceilingSentence = (family: CapacityFamilyId, toRung: number, maxRung: number): string =>
  (toRung >= maxRung
    ? '. That is the ceiling.'
    : `. ${sentenceText(family, maxRung)} is the ceiling.`);

const renderCapacityStep = (
  family: CapacityFamilyId, fromRung: number, toRung: number, maxRung: number,
): ReceiptLine => {
  const climb = `${ownedLabel(family)} ${growthVerb(family)} ${capacityTierText(toRung - fromRung)}. `
    + `${sentenceText(family, fromRung)} > ${capacityRungText(family, toRung)}${VALUE_UNIT[family] ?? ''}`;
  return detailPage([`${climb}${ceilingSentence(family, toRung, maxRung)}`, `${climb}.`]);
};

export { renderCapacityStep };
