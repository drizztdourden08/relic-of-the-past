/* @layer shared-game @kind logic */
import { KEY_DROP_LOCATIONS } from '../../scope-tables';
import { allOf } from '../combinators';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../../location-key.type';
import type { World, Rule } from '../../world.type';
import type { RuleEntry } from '../rule-entry.type';

const applyRule = (registry: Map<string, Rule>, entry: RuleEntry): void => {
  const { target, mode, rule } = entry;
  if (mode === 'set') {
    registry.set(target, rule);
    return;
  }
  const existing = registry.get(target);
  registry.set(target, existing === undefined ? rule : allOf(existing, rule));
};

const applyEntry = (world: World, exitNames: Set<string>, entry: RuleEntry): void => {
  if (entry.kind === 'exit') {
    if (!exitNames.has(entry.target)) throw new Error(`rule targets unknown exit: ${entry.target}`);
    applyRule(world.rules, entry);
    return;
  }
  if (entry.kind === 'event') {
    if (!world.eventsByKey.has(entry.target as CheckId)) throw new Error(`rule targets unknown event: ${entry.target}`);
    applyRule(world.eventRules as Map<string, Rule>, entry);
    return;
  }
  const key = entry.target as LocationKey;
  if (!world.locationsByKey.has(key)) {
    if (!world.options.keyDropShuffle && KEY_DROP_LOCATIONS.has(key as CheckId)) return;
    throw new Error(`rule targets unknown location: ${key}`);
  }
  applyRule(world.locationRules as Map<string, Rule>, entry);
};

export { applyEntry };
