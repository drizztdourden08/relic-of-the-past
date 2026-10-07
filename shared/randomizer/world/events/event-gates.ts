/* @layer shared-game @kind logic */
/**
 * Reading the record of what the player did, and asking rules about it.
 *
 * A world built with `actTokens` answers from that record: an act it does not list has not
 * happened. A world built without one has no record to read, which is every fill, so an act
 * falls back to the capability that would perform it and the answer is the one the rules gave
 * before acts existed. A story event found in the world has no such fallback: the sweep grants
 * it where it happens, so a rule asks for it by its check alone (story-event-rule.ts).
 */
import { EVENT_GATES } from './event-gates.data';
import { WORLD_EVENT_IDS } from './story-events.data';
import { compileRule } from '../rules/rule-eval';
import { any, has, option } from '../rules/rule-node-build';
import type { ActToken, EventGate } from './event-gate.type';
import type { Rule } from '../world.type';

const GATE_BY_CHECK: ReadonlyMap<string, EventGate> = new Map(EVENT_GATES.map((gate) => [gate.checkId, gate]));

/** Every act a record can certify: the gated acts, then the story events found in the world. */
const RECORDED_ACTS: readonly ActToken[] = [...EVENT_GATES.map((gate) => gate.checkId), ...WORLD_EVENT_IDS];

/** The acts this set of completed dataset checks proves. */
const actTokensOf = (completedCheckIds: Iterable<string>): Set<ActToken> => {
  const done = completedCheckIds instanceof Set ? completedCheckIds : new Set(completedCheckIds);
  return new Set(RECORDED_ACTS.filter((checkId) => done.has(checkId)));
};

/**
 * The rule for one act, named by the check that certifies it: it was done, or the means to do
 * it are in hand. An act with no precondition cannot be judged from an inventory at all, so a
 * world with no record reads it as available and a world with one answers from the record
 * alone. An id with no gate row is a build-time error and never a silent open.
 */
const actGate = (checkId: string): Rule => {
  const gate = GATE_BY_CHECK.get(checkId);
  if (gate === undefined) throw new Error(`no event gate for check: ${checkId}`);
  const { precondition } = gate;
  return compileRule(any(
    has(gate.checkId),
    precondition === undefined ? option('events.recordAttached', false) : precondition.node,
  ));
};

export { actGate, actTokensOf };
