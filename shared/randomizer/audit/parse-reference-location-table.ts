/* @layer shared-game @kind logic */
import {
  ENTRY_PATTERN, MIN_EXPECTED_LOCATIONS, TABLE_END_MARKER, TABLE_START_MARKER,
} from './reference-source.constants';
import type { ReferenceLocation } from './reference-source.type';

const unquote = (quoted: string): string =>
  quoted.slice(1, -1).replace(/\\(['"\\])/g, '$1');

const firstInt = (raw: string): number | null => {
  const match = raw.match(/0x[0-9a-fA-F]+|\d+/);
  return match === null ? null : Number(match[0]);
};

const parseReferenceLocationTable = (regionsPyText: string): ReferenceLocation[] => {
  const start = regionsPyText.indexOf(TABLE_START_MARKER);
  const end = regionsPyText.indexOf(TABLE_END_MARKER);
  if (start < 0 || end <= start) {
    throw new Error('reference-source: location_table block not found in Regions fixture');
  }

  const block = regionsPyText.slice(start, end);
  const locations: ReferenceLocation[] = [];
  for (const match of block.matchAll(ENTRY_PATTERN)) {
    locations.push({
      name: unquote(match[1]),
      romAddress: match[2] === 'None' ? null : firstInt(match[2]),
      isPrize: match[3] === 'True',
    });
  }

  if (locations.length < MIN_EXPECTED_LOCATIONS) {
    throw new Error(
      `reference-source: parsed only ${locations.length} locations (expected >= ${MIN_EXPECTED_LOCATIONS}), parser drift`,
    );
  }
  return locations;
};

export { parseReferenceLocationTable };
