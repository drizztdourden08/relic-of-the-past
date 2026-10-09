/* @layer electron-main @kind constants */
const KIND_ROOTS = {
  screen: ['screens'],
  connection: ['connections'],
  check: ['checks'],
  item: ['items'],
  dungeon: ['dungeons'],
  area: ['areas'],
  location: ['locations'],
  actor: ['actors'],
  tag: ['tags'],
  'item-group': ['item-groups/item-groups.ts'],
  enumeration: ['enumeration/enumeration.ts'],
} as const satisfies Record<string, readonly string[]>;

export { KIND_ROOTS };
