/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID, all, get, KIND_ID_PREFIXES, LAST_EVENT_BIT } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import { recordReferences } from './record-references';
import { describeDataset } from '../../dataset-guard';

const KINDS = Object.keys(KIND_ID_PREFIXES) as EntityKind[];

const UNPLACED = [PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID] as readonly string[];

type LedgerRow = { readonly id: string; readonly kind: string; readonly bit: number };
type BitGroup = [number, readonly LedgerRow[]];

const isEventRow = (row: LedgerRow): boolean => row.kind === 'event';

const eventsOnBit = ([bit, group]: BitGroup) => ({ bit, events: group.filter(isEventRow) });

const sharedBitLine = ({ bit, events }: { bit: number; events: readonly LedgerRow[] }): string =>
  `bit ${bit}: ${events.map((row) => row.id).join(', ')}`;

const placesAndEventsOnBit = ([bit, group]: BitGroup) => ({
  bit,
  places: group.filter((row) => row.kind !== 'event'),
  events: group.filter(isEventRow),
});

const placeLabel = (row: LedgerRow): string => `${row.id} (${row.kind})`;

const unpairedBitLine = ({ bit, places }: { bit: number; places: readonly LedgerRow[] }): string =>
  `bit ${bit}: ${places.map(placeLabel).join(', ')}`;

describeDataset('every id a record points at', () => {
  const references = recordReferences();

  it('collects a reference from every collection that holds one', () => {
    const fields = new Set(references.map((reference) => reference.field));
    expect(references.length).toBeGreaterThan(10000);
    for (const field of ['toConnectionId', 'vanillaItemIds', 'regionId', 'roomScreenIds']) {
      expect(fields, field).toContain(field);
    }
  });

  it('resolves to a record of the kind the field names', () => {
    const dangling = references
      .filter((reference) => !UNPLACED.includes(reference.id))
      .filter((reference) => get(reference.kind, reference.id) === undefined)
      .map((reference) => `${reference.from}.${reference.field} -> no ${reference.kind} '${reference.id}'`);
    expect([...new Set(dangling)].sort()).toEqual([]);
  });

  it('spells every reference with the prefix of the collection it names', () => {
    const wrong = references
      .filter((reference) => !reference.id.startsWith(`${KIND_ID_PREFIXES[reference.kind]}-`))
      .map((reference) => `${reference.from}.${reference.field} -> '${reference.id}' is not a ${reference.kind} id`);
    expect([...new Set(wrong)].sort()).toEqual([]);
  });
});

describeDataset('every id a record carries', () => {
  it('is unique inside its own collection', () => {
    const duplicates: string[] = [];
    for (const kind of KINDS) {
      const seen = new Set<string>();
      for (const record of all(kind)) {
        const id = (record as { id: string }).id;
        if (seen.has(id)) duplicates.push(`${kind}: ${id} twice`);
        seen.add(id);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it('is spelled with its own collection prefix', () => {
    const wrong: string[] = [];
    for (const kind of KINDS) {
      for (const record of all(kind)) {
        const id = (record as { id: string }).id;
        if (!id.startsWith(`${KIND_ID_PREFIXES[kind]}-`)) wrong.push(`${kind}: ${id}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describeDataset('a screen and the places above it', () => {
  const agrees = (above: string, screen: string): boolean => above === 'both' || above === screen;

  it('agrees with its area about the world', () => {
    const wrong = all('screen')
      .filter((screen) => screen.areaId !== PLACEHOLDER_AREA_ID)
      .map((screen) => ({ screen, area: get('area', screen.areaId) }))
      .filter((row) => row.area !== undefined && !agrees(row.area.world, row.screen.world))
      .map((row) => `${row.screen.id} is ${row.screen.world}, ${row.area?.id} is ${row.area?.world}`);
    expect(wrong).toEqual([]);
  });

  it('agrees with the area its location is filed under', () => {
    const wrong = all('screen')
      .filter((screen) => screen.locationId !== PLACEHOLDER_LOCATION_ID)
      .map((screen) => {
        const location = get('location', screen.locationId);
        const area = location && get('area', location.areaId);
        return { screen, location, area };
      })
      .filter((row) => row.area !== undefined && !agrees(row.area.world, row.screen.world))
      .map((row) => `${row.screen.id} is ${row.screen.world}, ${row.location?.id} sits in ${row.area?.id} (${row.area?.world})`);
    expect(wrong).toEqual([]);
  });

  it('agrees with its region about the world', () => {
    const wrong = all('screen')
      .filter((screen) => screen.regionId !== undefined)
      .map((screen) => ({ screen, region: get('region', screen.regionId as string) }))
      .filter((row) => row.region !== undefined && !agrees(row.region.world, row.screen.world))
      .map((row) => `${row.screen.id} is ${row.screen.world}, ${row.region?.id} is ${row.region?.world}`);
    expect(wrong).toEqual([]);
  });

  it('puts a location in the same area as every screen that names it', () => {
    const wrong: string[] = [];
    for (const screen of all('screen')) {
      if (screen.locationId === PLACEHOLDER_LOCATION_ID) continue;
      const location = get('location', screen.locationId);
      if (location && location.areaId !== screen.areaId) {
        wrong.push(`${screen.id} sits in ${screen.areaId}, its location ${location.id} in ${location.areaId}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describeDataset('the event ledger', () => {
  const rows = all('check')
    .filter((check) => check.gameId.eventBit !== undefined)
    .map((check) => ({ id: check.id, kind: check.kind, bit: check.gameId.eventBit as number }));
  const byBit = new Map<number, typeof rows>();
  for (const row of rows) byBit.set(row.bit, [...(byBit.get(row.bit) ?? []), row]);

  it('gives a bit to enough rows that the read is not empty', () => {
    expect(rows.length).toBeGreaterThan(50);
  });

  it('keeps every bit inside the ledger the core declares', () => {
    const outside = rows
      .filter((row) => !Number.isInteger(row.bit) || row.bit < 0 || row.bit > LAST_EVENT_BIT)
      .map((row) => `${row.id}: bit ${row.bit}, the ledger ends at ${LAST_EVENT_BIT}`);
    expect(outside).toEqual([]);
  });

  it('gives no two event rows the same bit', () => {
    const shared = [...byBit]
      .map(eventsOnBit)
      .filter((entry) => entry.events.length > 1)
      .map(sharedBitLine);
    expect(shared).toEqual([]);
  });

  it('pairs every location on a bit with exactly one event row', () => {
    const wrong = [...byBit]
      .map(placesAndEventsOnBit)
      .filter((entry) => entry.places.length > 0 && (entry.places.length > 1 || entry.events.length !== 1))
      .map(unpairedBitLine);
    expect(wrong).toEqual([]);
  });
});

describe('the exemption list', () => {
  it('holds the two unplaced ids and nothing else', () => {
    expect(UNPLACED).toEqual(['area-000', 'location-000']);
  });
});
