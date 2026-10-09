/* @layer tests @kind helper */
import { createHash } from 'node:crypto';
import { all } from '@rotp/game-data';
import { actTokensOf } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import { DIGEST_LENGTH } from './rule-parity-harness.constants';
import type { ParityDigest } from './rule-parity-harness.type';
import { prepareState } from './prepare-state';
import { seededRandom } from './seeded-random';
import { worldOfSnapshot } from './world-of-snapshot';

const ruleDigest = (over: Record<string, OptionValue>, states: number, actRecord = false): ParityDigest => {
  const { world, items } = worldOfSnapshot(over);
  const random = seededRandom(states * 7919 + Object.keys(over).length);
  const actTokens = actRecord ? actTokensOf(all('check').map((check) => check.id)) : null;
  const hash = createHash('sha256');
  const locations = [...world.locationRules.entries(), ...world.eventRules.entries()];
  const exits = [...world.rules.entries()];
  let trues = 0;
  for (let index = 0; index < states; index += 1) {
    const state = prepareState({ world, items, random, index, actTokens });
    let bits = '';
    for (const [, rule] of locations) bits += rule(state) ? '1' : '0';
    for (const [, rule] of exits) bits += rule(state) ? '1' : '0';
    for (const char of bits) if (char === '1') trues += 1;
    hash.update(bits);
  }
  const names = [...locations.map(([key]) => key as LocationKey), ...exits.map(([name]) => name)].join('|');
  hash.update(names);
  return { digest: hash.digest('hex').slice(0, DIGEST_LENGTH), trues };
};

export { ruleDigest };
