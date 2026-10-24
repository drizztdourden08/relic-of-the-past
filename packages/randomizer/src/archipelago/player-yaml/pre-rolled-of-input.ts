/* @layer shared-game @kind logic */
import { preRolledOfSnapshot } from '../pre-rolled';
import { deliverableListsOf } from '../../world/fill/deliverable-lists';
import type { PlayerYamlInput } from './player-yaml.type';

/** The caller's own values, or the ones the seed text rolls; none without either. */
const preRolledOfInput = (input: PlayerYamlInput): Record<string, unknown> | undefined => {
  const { options, seedText, preRolled, deliverable } = input;
  if (preRolled !== undefined) return preRolled;
  if (seedText === undefined) return undefined;
  const sets = deliverable ?? {};
  return { ...preRolledOfSnapshot(seedText, options, sets), deliverable: deliverableListsOf(sets) };
};

export { preRolledOfInput };
