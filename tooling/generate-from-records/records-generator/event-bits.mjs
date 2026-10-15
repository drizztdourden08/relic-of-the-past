/* @layer tooling-scripts @kind build */
import { generatedHeader } from './generated-header.mjs';

const EVENT_IDS_H = 'core/game-hooks/events/event_ids.h';

const EVENT_BIT_RUNS = [
  { key: 'bossKilled', first: 'kEvent_BossKilled_Sewers', last: 'kEvent_BossKilled_GanonsTower' },
  { key: 'prizeTaken', first: 'kEvent_PrizeTaken_Sewers', last: 'kEvent_PrizeTaken_GanonsTower' },
  { key: 'skullWoodsEntrance', first: 'kEvent_SkullWoodsEntrance_0', last: 'kEvent_SkullWoodsEntrance_4' },
];

const EVENT_BIT_NAMES_OTHER_THAN_CAMEL_CASE = {
  kEvent_RematchKilled_Armos: 'rematchArmos',
  kEvent_RematchKilled_Lanmolas: 'rematchLanmolas',
  kEvent_RematchKilled_Moldorm: 'rematchMoldorm',
  kEvent_MagicBatSummoned: 'magicBat',
  kEvent_PowderBagTaken: 'powderBag',
  kEvent_TurtleRockLedge_BigChest: 'turtleRockBigChestLedge',
  kEvent_TurtleRockLedge_LaserBridge: 'turtleRockLaserBridge',
};

const camelOf = (cName) => cName.replace(/^kEvent_/, '').split('_')
  .map((part, i) => (i === 0 ? part.charAt(0).toLowerCase() + part.slice(1) : part))
  .join('');

const keyOf = (cName) => EVENT_BIT_NAMES_OTHER_THAN_CAMEL_CASE[cName] ?? camelOf(cName);

const readEventIds = (read) => {
  const text = read(EVENT_IDS_H);
  const body = text.slice(text.indexOf('typedef enum {'), text.indexOf('} EventId;'));
  const names = [];
  for (const line of body.split('\n')) {
    const match = /^\s*(kEvent[A-Za-z0-9_]*)/.exec(line);
    if (match && match[1] !== 'kEventCount') names.push(match[1]);
  }
  if (names.length === 0) throw new Error(`generate: no enumerators found in ${EVENT_IDS_H}`);
  return names;
};

const runsByName = (names) => {
  const indexOf = new Map(names.map((name, i) => [name, i]));
  const runOf = new Map();
  for (const run of EVENT_BIT_RUNS) {
    const from = indexOf.get(run.first);
    const to = indexOf.get(run.last);
    if (from === undefined || to === undefined) throw new Error(`generate: ${run.key} names a bit ${EVENT_IDS_H} does not hold`);
    for (let i = from; i <= to; i++) runOf.set(names[i], { run, first: from });
  }
  return runOf;
};

const eventBitLines = (names, runOf) => {
  const lines = [];
  names.forEach((name, index) => {
    const grouped = runOf.get(name);
    if (grouped === undefined) {
      lines.push(`  ${keyOf(name)}: ${index},`);
      return;
    }
    if (grouped.first !== index) return;
    const bits = names.map((_, i) => i).filter((i) => runOf.get(names[i])?.run === grouped.run);
    lines.push(`  ${grouped.run.key}: [${bits.join(', ')}],`);
  });
  return lines;
};

const buildEventBits = (read) => {
  const names = readEventIds(read);
  const runOf = runsByName(names);
  const lines = eventBitLines(names, runOf);

  const last = names[names.length - 1];
  if (runOf.has(last)) throw new Error('generate: the last ledger bit is part of a run, so LAST_EVENT_BIT has no key');

  return `${generatedHeader('shared-game', 'data')}
const EVENT_BIT = {
${lines.join('\n')}
} as const;

const LAST_EVENT_BIT = EVENT_BIT.${keyOf(last)};

export { EVENT_BIT, LAST_EVENT_BIT };
`;
};

export { buildEventBits };
