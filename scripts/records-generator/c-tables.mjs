/* @layer tooling-scripts @kind build */
const PALACE_SLOTS = 14;

const cByte = (value) => (value === 0 ? '0' : `0x${value.toString(16).toUpperCase().padStart(2, '0')}`);

const prizeSlotOf = (dungeon, slotCount) => {
  const slot = (dungeon.gameId?.palaceIndex ?? -1) >> 1;
  return slot < 0 || slot >= slotCount ? null : slot;
};

const nativePrizeOf = (data, prizes, dungeon) => {
  const prize = prizes.find((check) => check.dungeonId === dungeon.id);
  const itemId = prize?.vanillaItemIds?.[0];
  if (itemId === undefined) return null;
  const item = data.getItem(itemId);
  const native = item.gameId?.receiveItemId ?? data.vanillaPrizeGrantIdOfName(item.name);
  if (native === undefined) throw new Error(`generate: ${item.name} (${itemId}) has no native receive id`);
  return native;
};

const vanillaPrizeItem = (data) => {
  const items = new Array(PALACE_SLOTS - 1).fill(0);
  const prizes = data.all('check').filter((check) => check.kind === 'prize');
  for (const dungeon of data.all('dungeon')) {
    const slot = prizeSlotOf(dungeon, items.length);
    if (slot === null) continue;
    const native = nativePrizeOf(data, prizes, dungeon);
    if (native !== null) items[slot] = native;
  }
  return items;
};

const C_TABLES = [
  {
    file: 'core/game-hooks/prize_presentation.c',
    name: 'kVanillaPrizeItem',
    build: (data) => `// clang-format off
static const uint8 kVanillaPrizeItem[${PALACE_SLOTS - 1}] = {
  ${vanillaPrizeItem(data).map(cByte).join(', ')},
};
// clang-format on`,
  },
];

const beginMarker = (name) => `/* generated: begin ${name} */`;
const endMarker = (name) => `/* generated: end ${name} */`;

const spliceCTable = (source, name, table) => {
  const begin = source.indexOf(beginMarker(name));
  const end = source.indexOf(endMarker(name));
  if (begin < 0 || end < 0) throw new Error(`generate: ${name} has no generated-block markers`);
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const head = source.slice(0, begin + beginMarker(name).length);
  const block = table.split('\n').join(eol);
  return `${head}${eol}${block}${eol}${source.slice(end)}`;
};

const cTableTargets = (data, read) => C_TABLES.map((table) => ({
  path: table.file,
  content: spliceCTable(read(table.file), table.name, table.build(data)),
  label: `${table.file} (${table.name})`,
}));

export { cTableTargets };
