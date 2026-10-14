/* @layer shared-game @kind logic */
import { canCollectLocation } from '../collect';
import { readRuleOption } from '../rule-options';
import { readSeedValue } from '../seed-value-read';
import type { RuleCheck } from '../rules.type';
import type { WorldQueryNode } from './rule-op-groups.type';

const compileWorldQuery = (node: WorldQueryNode): RuleCheck => {
  switch (node.op) {
    case 'region': {
      const { region } = node;
      return (state) => state.canReachRegion(region);
    }
    case 'location': {
      const { location } = node;
      return (state) => canCollectLocation(state, location);
    }
    case 'exit': {
      const { name } = node;
      return (state) => {
        const rule = state.world.getRule(name);
        return rule === undefined || rule(state);
      };
    }
    case 'placedAt': {
      const { location, item } = node;
      return (state) => state.world.placedItems.get(location) === item;
    }
    case 'option': {
      const { key, equals } = node;
      return (state) => readRuleOption(state.world, key) === equals;
    }
    case 'seed': {
      const { key, equals } = node;
      return (state) => readSeedValue(state.world, key) === equals;
    }
  }
};

export { compileWorldQuery };
