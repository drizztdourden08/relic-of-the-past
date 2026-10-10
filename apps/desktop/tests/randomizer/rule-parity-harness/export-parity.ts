/* @layer tests @kind helper */
import { all } from '@rotp/game-data';
import { actTokensOf, compileRule, inlineNamedRules, walkRuleNode, ruleNodesOfWorld } from '@rotp/randomizer';
import type { Rule, RuleNode, OptionValue, World } from '@rotp/randomizer';
import { required } from '../../required';
import type { ExportParity } from './rule-parity-harness.type';
import { prepareState } from './prepare-state';
import { seededRandom } from './seeded-random';
import { worldOfSnapshot } from './world-of-snapshot';

type RulePair = [string, Rule, Rule];
type RuleView = ReturnType<typeof ruleNodesOfWorld>;

const pairsOf = (world: World, view: RuleView, exported: (node: RuleNode) => Rule): RulePair[] => {
  const pairs: RulePair[] = [];
  for (const [key, rule] of world.locationRules) pairs.push([key, rule, exported(required(view.locations[key], key))]);
  for (const event of view.events) {
    const rule = world.getEventRule(event.key);
    if (rule !== undefined) pairs.push([event.key, rule, exported(event.node)]);
  }
  for (const exit of view.exits) {
    const rule = world.getRule(exit.name);
    if (rule !== undefined) pairs.push([exit.name, rule, exported(exit.node)]);
  }
  return pairs;
};

const exportParity = (over: Record<string, OptionValue>, states: number, actRecord = false): ExportParity => {
  const { world, items } = worldOfSnapshot(over);
  const view = JSON.parse(JSON.stringify(ruleNodesOfWorld(world))) as RuleView;
  const residualCalls = new Set<string>();
  const exported = (node: RuleNode): Rule => {
    const inlined = inlineNamedRules(node, world);
    walkRuleNode(inlined, (visited) => { if (visited.op === 'helper') residualCalls.add(visited.name); });
    return compileRule(inlined);
  };
  const pairs = pairsOf(world, view, exported);
  const random = seededRandom(states * 104729);
  const actTokens = actRecord ? actTokensOf(all('check').map((check) => check.id)) : null;
  const mismatches = new Set<string>();
  for (let index = 0; index < states; index += 1) {
    const state = prepareState({ world, items, random, index, actTokens });
    for (const [name, engine, exportedRule] of pairs) {
      if (engine(state) !== exportedRule(state)) mismatches.add(name);
    }
  }
  return { asked: pairs.length * states, mismatches: [...mismatches], residualCalls: [...residualCalls].sort() };
};

export { exportParity };
