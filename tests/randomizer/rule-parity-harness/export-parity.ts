/* @layer tests @kind helper */
import { all } from '@shared/game/data';
import { actTokensOf } from '@shared/randomizer/world/events/event-gates';
import { compileRule } from '@shared/randomizer/world/rules/rule-eval';
import { inlineHelpers, walkRuleNode } from '@shared/randomizer/world/rules/rule-node-walk';
import { ruleNodesOfWorld } from '@shared/randomizer/world/rules/world-rules-view';
import type { Rule } from '@shared/randomizer/world/world.type';
import type { RuleNode } from '@shared/randomizer/world/rules/rule-node.type';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { ExportParity } from './rule-parity-harness.type';
import { prepareState } from './prepare-state';
import { seededRandom } from './seeded-random';
import { worldOfSnapshot } from './world-of-snapshot';

const exportParity = (over: Record<string, OptionValue>, states: number, actRecord = false): ExportParity => {
  const { world, items } = worldOfSnapshot(over);
  const view = JSON.parse(JSON.stringify(ruleNodesOfWorld(world))) as ReturnType<typeof ruleNodesOfWorld>;
  const pairs: Array<[string, Rule, Rule]> = [];
  const leftHelpers = new Set<string>();
  const exported = (node: RuleNode): Rule => {
    const inlined = inlineHelpers(node, world);
    walkRuleNode(inlined, (visited) => { if (visited.op === 'helper') leftHelpers.add(visited.name); });
    return compileRule(inlined);
  };
  for (const [key, rule] of world.locationRules) pairs.push([key, rule, exported(view.locations[key])]);
  for (const event of view.events) {
    const rule = world.getEventRule(event.key);
    if (rule !== undefined) pairs.push([event.key, rule, exported(event.node)]);
  }
  for (const exit of view.exits) {
    const rule = world.getRule(exit.name);
    if (rule !== undefined) pairs.push([exit.name, rule, exported(exit.node)]);
  }
  const random = seededRandom(states * 104729);
  const actTokens = actRecord ? actTokensOf(all('check').map((check) => check.id)) : null;
  const mismatches = new Set<string>();
  for (let index = 0; index < states; index += 1) {
    const state = prepareState({ world, items, random, index, actTokens });
    for (const [name, engine, exportedRule] of pairs) {
      if (engine(state) !== exportedRule(state)) mismatches.add(name);
    }
  }
  return { asked: pairs.length * states, mismatches: [...mismatches], leftHelpers: [...leftHelpers].sort() };
};

export { exportParity };
