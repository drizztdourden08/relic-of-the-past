/* @layer shared-game @kind logic */
/**
 * Reading the record of what the player did, and asking rules about it.
 *
 * A world built with `actTokens` answers from that record: an act it does not list has not
 * happened. A world built without one has no record to read, which is every fill, so an act
 * falls back to the capability that would perform it and the answer is the one the rules gave
 * before acts existed.
 */
import { EVENT_GATES } from './event-gates.data';
import { compileRule } from '../rules/rule-eval';
import { any, has, option } from '../rules/rule-node-build';
import type { ActToken, EventGate } from './event-gate.type';
import type { ItemKey } from '../item-ids.data';
import type { Rule } from '../world.type';

const GATE_BY_CHECK: ReadonlyMap<string, EventGate> = new Map(EVENT_GATES.map((gate) => [gate.checkId, gate]));

/** What the state calls this act: the event item where there is one, else the check itself. */
const tokenOf = (gate: EventGate): ActToken => gate.token ?? gate.checkId;

/** The tokens a dataset check certifies, so a location holding one is never guessed at. */
const CERTIFIED_TOKENS: ReadonlySet<ActToken> = new Set(EVENT_GATES.map(tokenOf));

/** The acts this set of completed dataset checks proves. */
const actTokensOf = (completedCheckIds: Iterable<string>): Set<ActToken> => {
  const done = completedCheckIds instanceof Set ? completedCheckIds : new Set(completedCheckIds);
  const tokens = new Set<ActToken>();
  for (const gate of EVENT_GATES) if (done.has(gate.checkId)) tokens.add(tokenOf(gate));
  return tokens;
};

/** Whether an event item's token has a check behind it, which decides who may grant it. */
const isCertifiedAct = (token: ItemKey): boolean => CERTIFIED_TOKENS.has(token as ActToken);

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
  const token = tokenOf(gate);
  return compileRule(any(
    has(token),
    precondition === undefined ? option('events.recordAttached', false) : precondition.node,
  ));
};

export { actGate, actTokensOf, isCertifiedAct };
