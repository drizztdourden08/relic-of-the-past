/* @layer tooling-scripts @kind build */
/**
 * The one generator. Every file that restates a record is written from here.
 *
 *   node scripts/generate-from-records.mjs            writes every target
 *   node scripts/generate-from-records.mjs --check     writes nothing, exits 1 on a difference
 *
 * `--check` is what CI and tests/game/data/generated-mirrors.keep.test.ts run: a target
 * whose file on disk differs from a fresh generation is a hand edit, and the run fails
 * naming the file.
 *
 * The dataset is loaded the way the app loads it. Vite's SSR module runner imports
 * `shared/game/data/index.ts`, which seeds the registry, so a target reads records
 * through the facade getters and never imports a record file by path.
 *
 * Two output shapes. A TypeScript target owns its whole file, is named `*.generated.ts`
 * (or `*.generated.type.ts` for its types) and carries no comment but the gate's
 * `@layer`/`@kind` header. A C target owns one table inside a file that also
 * holds hand code, so it is spliced between a pair of "generated: begin" and
 * "generated: end" block comments and the surrounding C is left alone.
 *
 * Four tables the plan lists as generated are NOT here, because no record holds what they
 * state. Each one is a record gap first and a generator target second:
 *
 *   events/event_areas.h        34 of its 56 head rows come from a region's headScreenId or
 *                               from the event's own screen, and all 11 boxes come from a
 *                               region's bounds. The remaining 22 head rows are the extra
 *                               area heads a large dark-world region covers, which no record
 *                               lists; a flood over the region's member screens reproduces
 *                               four of those sets and over-produces three. Of the 19
 *                               entrance rows, 6 resolve fully; the other 13 need an
 *                               overworldIndex 56 overworld screens do not carry, or a link
 *                               from an event to the entrance ids it stands for.
 *   npc_overrides.c
 *     kSubstitutionBits         the (byte, mask) allocation is a save-layout fact owned by
 *                               save_bytes.h, and three of its keys are synthetic ids no
 *                               game value backs. A check record says neither.
 *   inventory-layouts/*.ts      a slot needs a save slot, a display name and one icon for the
 *                               whole tier family. An item record carries none of the three,
 *                               and its spriteId is the tier's own art, not the slot's.
 *   records/native-tables/*.ts  these transcribe the decompilation's switch statements and
 *                               its display words, not a byte table in the cartridge, so
 *                               there is no address to read them from.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVENT_IDS_H = 'core/game-hooks/events/event_ids.h';
const RUN_HINT = 'pnpm run generate';

const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => readFileSync(abs(rel), 'utf8');
const readIfPresent = (rel) => (existsSync(abs(rel)) ? read(rel) : null);

/** The dataset, seeded exactly as the app seeds it. */
const loadDataset = async () => {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, watch: null },
    resolve: {
      alias: {
        '@shared': abs('shared'),
        '@app': abs('apps/web/src'),
        '@domains': abs('apps/web/src/ui/domains'),
      },
    },
  });
  const data = await server.ssrLoadModule('/shared/game/data/index.ts');
  return { data, close: () => server.close() };
};

/** Fold a sentence into comment lines of at most `width` characters, prefix included. */
const wrapped = (text, prefix, width = 98) => {
  const lines = [];
  let line = prefix;
  for (const word of text.split(' ')) {
    if (line === prefix) { line = `${prefix}${word}`; continue; }
    if (`${line} ${word}`.length > width) { lines.push(line); line = `${prefix}${word}`; continue; }
    line = `${line} ${word}`;
  }
  lines.push(line);
  return lines.join('\n');
};

/**
 * The only text a generated TypeScript file carries above its code: the gate's header. That
 * it is generated is said by its `.generated` name, and where it comes from by
 * docs/architecture/code-notes/game-data.md ("Generated files").
 */
const header = (layer, kind) => `/* @layer ${layer} @kind ${kind} */\n`;

// ─── event-bits.generated.ts, from the ledger's own header ─────────────────────────────────────────

/**
 * Runs of ledger bits the TypeScript side reads as one array, indexed by palace or by
 * entrance number. The C side spells every slot out, because an enum cannot hold a run.
 */
const EVENT_BIT_RUNS = [
  { key: 'bossKilled', first: 'kEvent_BossKilled_Sewers', last: 'kEvent_BossKilled_GanonsTower' },
  { key: 'prizeTaken', first: 'kEvent_PrizeTaken_Sewers', last: 'kEvent_PrizeTaken_GanonsTower' },
  { key: 'skullWoodsEntrance', first: 'kEvent_SkullWoodsEntrance_0', last: 'kEvent_SkullWoodsEntrance_4' },
];

/** The seven keys whose TypeScript name is not the camel-case of the C one. */
const EVENT_BIT_NAMES = {
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

/** Every enumerator of `EventId`, in the header's frozen order, without `kEventCount`. */
const readEventIds = () => {
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

const buildEventBits = () => {
  const names = readEventIds();
  const indexOf = new Map(names.map((name, i) => [name, i]));
  const runOf = new Map();
  for (const run of EVENT_BIT_RUNS) {
    const from = indexOf.get(run.first);
    const to = indexOf.get(run.last);
    if (from === undefined || to === undefined) throw new Error(`generate: ${run.key} names a bit ${EVENT_IDS_H} does not hold`);
    for (let i = from; i <= to; i++) runOf.set(names[i], { run, first: from });
  }

  const lines = [];
  names.forEach((name, index) => {
    const grouped = runOf.get(name);
    if (grouped === undefined) {
      lines.push(`  ${EVENT_BIT_NAMES[name] ?? camelOf(name)}: ${index},`);
      return;
    }
    if (grouped.first !== index) return;
    const bits = names.map((_, i) => i).filter((i) => runOf.get(names[i])?.run === grouped.run);
    lines.push(`  ${grouped.run.key}: [${bits.join(', ')}],`);
  });

  const last = names[names.length - 1];
  if (runOf.has(last)) throw new Error('generate: the last ledger bit is part of a run, so LAST_EVENT_BIT has no key');
  const lastKey = EVENT_BIT_NAMES[last] ?? camelOf(last);

  return `${header('shared-game', 'data')}
const EVENT_BIT = {
${lines.join('\n')}
} as const;

const LAST_EVENT_BIT = EVENT_BIT.${lastKey};

export { EVENT_BIT, LAST_EVENT_BIT };
`;
};

// ─── the three tag taxonomies, from records/tags ─────────────────────────────────────────

/**
 * One entry per taxonomy: which collection's tags it covers, and the names its consumers
 * import. Each taxonomy is two files, `<base>.generated.type.ts` for the unions and the
 * metadata shape and `<base>.generated.ts` for the two tables. A namespace with its own
 * sub-union is named here; a taxonomy of one namespace has none, and its union is built
 * straight from the values.
 */
const TAXONOMIES = [
  {
    base: 'shared/game/data/taxonomy/screen-tags',
    appliesTo: 'screen',
    union: 'ScreenTag',
    namespaceUnion: 'TagNamespace',
    metadataType: 'TagMetadata',
    metadata: 'TAG_METADATA',
    namespaces: 'TAG_NAMESPACES',
    groups: { env: 'EnvironmentTag', role: 'RoleTag', hazard: 'HazardTag', loot: 'LootTag', traverse: 'TraversalTag' },
  },
  {
    base: 'shared/game/data/taxonomy/connection-tags',
    appliesTo: 'connection',
    union: 'ConnectionTag',
    namespaceUnion: 'ConnectionTagNamespace',
    metadataType: 'ConnectionTagMetadata',
    metadata: 'CONNECTION_TAG_METADATA',
    namespaces: 'CONNECTION_TAG_NAMESPACES',
    groups: { transit: 'TransitTag', barrier: 'BarrierTag', ctx: 'ContextTag' },
  },
  {
    base: 'shared/game/data/taxonomy/check-content-tags',
    appliesTo: 'check',
    union: 'ContentTag',
    metadataType: 'ContentTagMetadata',
    metadata: 'CONTENT_TAG_METADATA',
    namespaces: 'CONTENT_TAG_NAMESPACES',
    groups: {},
  },
];

const quoted = (value) => `'${value}'`;
const unionOf = (values) => values.map(quoted).join(' | ');

/** Wrap a union at a readable width, continuing with the leading pipe style. */
const wrappedUnion = (name, values) => {
  const oneLine = `type ${name} = ${unionOf(values)};`;
  if (oneLine.length <= 110) return oneLine;
  const parts = [];
  let line = '';
  for (const value of values) {
    const next = line === '' ? quoted(value) : `${line} | ${quoted(value)}`;
    if (next.length > 90) { parts.push(line); line = quoted(value); continue; }
    line = next;
  }
  parts.push(line);
  return `type ${name} =\n${parts.map((part) => `  | ${part}`).join('\n')};`;
};

const buildTaxonomy = (spec, data) => {
  const tags = data.all('tag').filter((tag) => tag.appliesTo.includes(spec.appliesTo));
  if (tags.length === 0) throw new Error(`generate: no tag records apply to ${spec.appliesTo}`);

  const namespaceLabels = new Map();
  const valuesByNamespace = new Map();
  for (const tag of tags) {
    if (!namespaceLabels.has(tag.namespace)) namespaceLabels.set(tag.namespace, tag.namespaceLabel);
    valuesByNamespace.set(tag.namespace, [...(valuesByNamespace.get(tag.namespace) ?? []), tag.name]);
  }
  const namespaceIds = [...namespaceLabels.keys()];
  const missing = namespaceIds.filter((id) => spec.groups[id] === undefined);
  if (Object.keys(spec.groups).length > 0 && missing.length > 0) {
    throw new Error(`generate: ${spec.path} has no sub-union name for namespace ${missing.join(', ')}`);
  }

  const blocks = [];
  if (Object.keys(spec.groups).length > 0) {
    for (const id of namespaceIds) blocks.push(wrappedUnion(spec.groups[id], valuesByNamespace.get(id)));
    blocks.push(`type ${spec.union} = ${namespaceIds.map((id) => spec.groups[id]).join(' | ')};`);
  } else {
    blocks.push(wrappedUnion(spec.union, tags.map((tag) => tag.name)));
  }

  const namespaceType = spec.namespaceUnion ?? quoted(namespaceIds[0]);
  if (spec.namespaceUnion) blocks.push(wrappedUnion(spec.namespaceUnion, namespaceIds));

  blocks.push(`interface ${spec.metadataType} {
  id: ${spec.union};
  label: string;
  namespace: ${namespaceType};
}`);

  const typeExports = [
    spec.union, spec.metadataType, spec.namespaceUnion,
    ...namespaceIds.map((id) => spec.groups[id]),
  ].filter(Boolean).sort();

  const typeExportLine = `export type { ${typeExports.join(', ')} };`;
  const typeSource = `${header('shared-game', 'types')}
${blocks.join('\n\n')}

${typeExportLine.length <= 98 ? typeExportLine : `export type {\n${wrapped(typeExports.join(', '), '  ')},\n};`}
`;

  const tables = [
    `const ${spec.namespaces}: { id: ${namespaceType}; label: string }[] = [
${namespaceIds.map((id) => `  { id: ${quoted(id)}, label: ${quoted(namespaceLabels.get(id))} },`).join('\n')}
];`,
    `const ${spec.metadata}: ${spec.metadataType}[] = [
${tags.map((tag) => `  { id: ${quoted(tag.name)}, label: ${quoted(tag.label)}, namespace: ${quoted(tag.namespace)} },`).join('\n')}
];`,
  ];
  const typeImports = [spec.metadataType, spec.namespaceUnion].filter(Boolean).sort().join(', ');
  const dataSource = `${header('shared-game', 'data')}import type { ${typeImports} } from './${path.basename(spec.base)}.generated.type';

${tables.join('\n\n')}

export { ${[spec.metadata, spec.namespaces].sort().join(', ')} };
`;
  return { typeSource, dataSource };
};

// ─── the C tables, spliced into our own hook layer ───────────────────────────────────────

/** The hand tables' own spelling: a plain `0` for an empty slot, two uppercase hex digits otherwise. */
const cByte = (value) => (value === 0 ? '0' : `0x${value.toString(16).toUpperCase().padStart(2, '0')}`);

const PALACE_SLOTS = 14;

/** The native receive id each palace's own vanilla prize hands over; 0 where there is no prize. */
const vanillaPrizeItem = (data) => {
  const items = new Array(PALACE_SLOTS - 1).fill(0);
  const prizes = data.all('check').filter((check) => check.kind === 'prize');
  for (const dungeon of data.all('dungeon')) {
    const slot = (dungeon.gameId?.palaceIndex ?? -1) >> 1;
    if (slot < 0 || slot >= items.length) continue;
    const prize = prizes.find((check) => check.dungeonId === dungeon.id);
    const itemId = prize?.vanillaItemIds?.[0];
    if (itemId === undefined) continue;
    const item = data.getItem(itemId);
    const native = item.gameId?.receiveItemId ?? data.vanillaPrizeGrantIdOfName(item.name);
    if (native === undefined) throw new Error(`generate: ${item.name} (${itemId}) has no native receive id`);
    items[slot] = native;
  }
  return items;
};

const C_TABLES = [
  {
    file: 'core/game-hooks/prize_presentation.c',
    name: 'kVanillaPrizeItem',
    build: (data) => `static const uint8 kVanillaPrizeItem[${PALACE_SLOTS - 1}] = {
  ${vanillaPrizeItem(data).map(cByte).join(', ')},
};`,
  },
];

const beginMarker = (name) => `/* generated: begin ${name} */`;
const endMarker = (name) => `/* generated: end ${name} */`;

/**
 * Replace one marked block in a C file, leaving every other byte of it untouched. Our C
 * carries CRLF (no `.gitattributes` rule normalizes it), so the block is written in the
 * file's own line ending.
 */
const spliceCTable = (source, name, table) => {
  const begin = source.indexOf(beginMarker(name));
  const end = source.indexOf(endMarker(name));
  if (begin < 0 || end < 0) throw new Error(`generate: ${name} has no generated-block markers`);
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const head = source.slice(0, begin + beginMarker(name).length);
  const block = table.split('\n').join(eol);
  return `${head}${eol}${block}${eol}${source.slice(end)}`;
};

// ─── the run ─────────────────────────────────────────────────────────────────────────────

const taxonomyTargets = (spec, data) => {
  const { typeSource, dataSource } = buildTaxonomy(spec, data);
  return [
    { path: `${spec.base}.generated.type.ts`, content: typeSource },
    { path: `${spec.base}.generated.ts`, content: dataSource },
  ];
};

const targetsFor = (data) => [
  { path: 'shared/game/data/records/checks/events/event-bits.generated.ts', content: buildEventBits() },
  ...TAXONOMIES.flatMap((spec) => taxonomyTargets(spec, data)),
  ...C_TABLES.map((table) => ({
    path: table.file,
    content: spliceCTable(read(table.file), table.name, table.build(data)),
    label: `${table.file} (${table.name})`,
  })),
];

const run = async () => {
  const checkOnly = process.argv.includes('--check');
  const { data, close } = await loadDataset();
  let targets;
  try {
    targets = targetsFor(data);
  } finally {
    await close();
  }

  const stale = [];
  for (const target of targets) {
    const label = target.label ?? target.path;
    const current = readIfPresent(target.path);
    if (current === target.content) { console.log(`up to date  ${label}`); continue; }
    if (checkOnly) { stale.push(label); console.log(`STALE       ${label}`); continue; }
    writeFileSync(abs(target.path), target.content, 'utf8');
    console.log(`wrote       ${label}`);
  }

  if (checkOnly && stale.length > 0) {
    console.error(`\n${stale.length} generated target(s) differ from the records. Run \`${RUN_HINT}\`.`);
    process.exitCode = 1;
  }
};

await run();
