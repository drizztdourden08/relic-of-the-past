/* @layer shared-game @kind logic */
import { GROWTH_VERB, PLURAL_LABEL } from './capacity-rung-values.constants';
import type { CapacityFamilyId } from '@rotp/game-data';

const growthVerb = (family: CapacityFamilyId): string => {
  const verb = GROWTH_VERB[family];
  if (PLURAL_LABEL.has(family)) return verb;
  const [head, ...rest] = verb.split(' ');
  const inflected = /(?:s|sh|ch|x|z)$/.test(head) ? `${head}es` : `${head}s`;
  return [inflected, ...rest].join(' ');
};

export { growthVerb };
