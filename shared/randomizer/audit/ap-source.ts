/* @layer shared-game @kind logic */
/**
 * S2 source: parses the reference randomizer project's published data
 * fixtures (Archipelago worlds/alttp) as plain text/JSON. The Python file
 * is treated strictly as text and extracted with regexes; nothing is ever
 * executed.
 */
interface ApLocation {
  name: string;
  romAddress: number | null;
  isPrize: boolean;
}

interface ApDataPackage {
  locationNameToId: Record<string, number>;
  itemNameToId: Record<string, number>;
}

/** Parser drift guard: the table holds roughly 250 entries; far fewer means the regex broke. */
const MIN_EXPECTED_LOCATIONS = 200;
const TABLE_START_MARKER = 'location_table: typing.Dict';
const TABLE_END_MARKER = 'lookup_id_to_name';

/**
 * One dict entry: a quoted name (either quote style, backslash escapes
 * allowed), then a tuple whose first element is None, an int, or an int
 * list, whose second element is skipped, and whose third is the prize flag.
 * Multi-line entries are covered by the s flag.
 */
const ENTRY_PATTERN =
  /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:\s*\(\s*(None|0x[0-9a-fA-F]+|\d+|\[[^\]]*\])\s*,\s*(?:None|0x[0-9a-fA-F]+|\d+)\s*,\s*(True|False)/gs;

const unquote = (quoted: string): string =>
  quoted.slice(1, -1).replace(/\\(['"\\])/g, '$1');

/** First integer of `None`, an int literal, or an int list; null for None/empty. */
const firstInt = (raw: string): number | null => {
  const match = raw.match(/0x[0-9a-fA-F]+|\d+/);
  return match === null ? null : Number(match[0]);
};

const parseApLocationTable = (regionsPyText: string): ApLocation[] => {
  const start = regionsPyText.indexOf(TABLE_START_MARKER);
  const end = regionsPyText.indexOf(TABLE_END_MARKER);
  if (start < 0 || end <= start) {
    throw new Error('ap-source: location_table block not found in Regions fixture');
  }

  const block = regionsPyText.slice(start, end);
  const locations: ApLocation[] = [];
  for (const match of block.matchAll(ENTRY_PATTERN)) {
    locations.push({
      name: unquote(match[1]),
      romAddress: match[2] === 'None' ? null : firstInt(match[2]),
      isPrize: match[3] === 'True',
    });
  }

  if (locations.length < MIN_EXPECTED_LOCATIONS) {
    throw new Error(
      `ap-source: parsed only ${locations.length} locations (expected >= ${MIN_EXPECTED_LOCATIONS}), parser drift`,
    );
  }
  return locations;
};

const loadApDataPackage = (json: unknown): ApDataPackage => {
  const { location_name_to_id: locations, item_name_to_id: items } =
    json as { location_name_to_id?: Record<string, number>; item_name_to_id?: Record<string, number> };
  if (typeof locations !== 'object' || locations === null || typeof items !== 'object' || items === null) {
    throw new Error('ap-source: datapackage JSON missing location_name_to_id / item_name_to_id');
  }
  return { locationNameToId: locations, itemNameToId: items };
};

export { loadApDataPackage, MIN_EXPECTED_LOCATIONS, parseApLocationTable };
export { chestAddressToTableIndex, joinCrosswalk } from './chest-crosswalk';
export type { ApDataPackage, ApLocation };
