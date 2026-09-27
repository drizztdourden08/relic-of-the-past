/* @layer tests @kind helper */
/**
 * The export side of the rule-node parity guard: every location and exit tree of a world, with
 * every derived helper inlined down to primitive ops and sent through JSON and back, compiled
 * fresh and asked beside the rule the engine holds. A mismatch means an expansion (or a tree)
 * says something other than what the engine does, which is exactly what an exporter would hand
 * to the other side.
 */
import { all } from '@shared/game/data';
import { actTokensOf } from '@shared/randomizer/world/events/event-gates';
import { compileRule } from '@shared/randomizer/world/rules/rule-eval';
import { inlineHelpers, walkRuleNode } from '@shared/randomizer/world/rules/rule-node-walk';
import { ruleNodesOfWorld } from '@shared/randomizer/world/rules/world-rules-view';
import { randomState, scatterPlacements, seededRandom, worldOfSnapshot } from './rule-parity-harness';
import type { Holding } from '@shared/randomizer/world/collection-state';
import type { Rule } from '@shared/randomizer/world/world.type';
import type { RuleNode } from '@shared/randomizer/world/rules/rule-node.type';
import type { OptionValue } from '@shared/randomizer/world/options.type';

interface ExportParity {
  asked: number;
  mismatches: string[];
  /** The helpers still named once everything derived is inlined: primitives only, if sound. */
  leftHelpers: string[];
}

/** The exported tree of every rule, inlined and JSON round-tripped, against the engine's own rule. */
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
  for (const exit of view.exits) {
    const rule = world.getRule(exit.name);
    if (rule !== undefined) pairs.push([exit.name, rule, exported(exit.node)]);
  }
  const random = seededRandom(states * 104729);
  const tokens = actTokensOf(all('check').map((check) => check.id));
  const mismatches = new Set<string>();
  for (let index = 0; index < states; index += 1) {
    if (index % 2 === 1) scatterPlacements(world, items, random);
    else world.placedItems.clear();
    if (actRecord) {
      (world.options as { actTokens?: ReadonlySet<Holding> }).actTokens =
        new Set([...tokens].filter(() => random() < 0.5));
    }
    const state = randomState(world, items, random);
    for (const [name, engine, exported] of pairs) {
      if (engine(state) !== exported(state)) mismatches.add(name);
    }
  }
  return { asked: pairs.length * states, mismatches: [...mismatches], leftHelpers: [...leftHelpers].sort() };
};

export { exportParity };
export type { ExportParity };
