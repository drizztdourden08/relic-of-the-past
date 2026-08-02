/* @layer tests @kind test */
/**
 * The shape of what the screen editor sends to `screenEditor:writeScreen`.
 *
 * This is the one piece of real persistence the dataset tooling has — it writes
 * a generated record into a source file — so the payload is pinned here rather
 * than left to a click-through. Every assertion is about the record `handleWrite`
 * passes to the IPC call, not about how the form collects it.
 */
import { describe, it, expect } from 'vitest';
import { tagIdsForKeys } from '@shared/game/data';
import { buildScreenRecord } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/build-screen-record';
import type { ScreenDraft } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/build-screen-record';

const draft = (over: Partial<ScreenDraft>): ScreenDraft => ({
  kind: 'dungeon',
  world: 'light',
  interiorKind: 'cave',
  randomizerName: 'Test Room',
  areaId: 'area-011',
  locationId: 'location-011',
  status: 'draft',
  tags: [],
  variant: undefined,
  roomIndex: 0x80,
  overworldIndex: 0x1b,
  palaceIndex: 2,
  entranceId: undefined,
  gridX: 1,
  gridY: 2,
  floor: 0,
  existing: null,
  ...over,
});

describe('buildScreenRecord — the native id the record carries', () => {
  it('a dungeon room is addressed by room index plus palace index', () => {
    const { record } = buildScreenRecord(draft({}));
    expect(record?.gameId).toEqual({ roomIndex: 0x80, palaceIndex: 2 });
  });

  it('an overworld screen is addressed by its overworld index alone', () => {
    const { record } = buildScreenRecord(draft({ kind: 'overworld' }));
    expect(record?.gameId).toEqual({ overworldIndex: 0x1b });
  });

  it('an interior is addressed by room index plus the entrance that reaches it', () => {
    const { record } = buildScreenRecord(draft({ kind: 'interior', entranceId: 0x0c }));
    expect(record?.gameId).toEqual({ roomIndex: 0x80, entranceId: 0x0c });
  });

  it('only an interior keeps an interior kind', () => {
    expect(buildScreenRecord(draft({ kind: 'interior' })).record?.interiorKind).toBe('cave');
    expect(buildScreenRecord(draft({ kind: 'dungeon' })).record?.interiorKind).toBeUndefined();
  });
});

describe('buildScreenRecord — position and defaults', () => {
  it('carries a floor only alongside a grid position', () => {
    expect(buildScreenRecord(draft({})).record?.position).toEqual({ gridX: 1, gridY: 2, floor: 0 });
    expect(buildScreenRecord(draft({ floor: undefined })).record?.position)
      .toEqual({ gridX: 1, gridY: 2 });
  });

  it('omits the position entirely when there is no grid', () => {
    const { record } = buildScreenRecord(draft({ gridX: undefined, gridY: undefined, floor: undefined }));
    expect(record?.position).toBeUndefined();
  });

  it('falls back to the draft status when none was chosen', () => {
    expect(buildScreenRecord(draft({ status: undefined })).record?.status).toBe('draft');
  });

  it('trims the name and resolves the chosen terms to tag references', () => {
    const tags = ['role:boss'] as ScreenDraft['tags'];
    const { record } = buildScreenRecord(draft({ randomizerName: '  Spaced  ', tags }));
    expect(record?.randomizerName).toBe('Spaced');
    expect(record?.tags).toEqual(tagIdsForKeys(tags));
    expect(record?.tags).not.toBe(tags);
    // A reference, not the term the form worked in.
    for (const id of record?.tags ?? []) expect(id).toMatch(/^tag-\d+$/);
  });

  it('drops a term the vocabulary does not hold rather than writing it raw', () => {
    const tags = ['nonsense:not-a-real-term'] as ScreenDraft['tags'];
    expect(buildScreenRecord(draft({ tags })).record?.tags).toEqual([]);
  });
});

describe('buildScreenRecord — what it refuses to invent', () => {
  const blockersFor = (over: Partial<ScreenDraft>): readonly string[] =>
    buildScreenRecord(draft(over)).blockers;

  it.each([
    ['a name', { randomizerName: '   ' }],
    ['an area', { areaId: '' as const }],
    ['a location', { locationId: '' as const }],
    ['a palace index', { palaceIndex: undefined }],
  ])('reports a blocker and no record without %s', (_what, over) => {
    const result = buildScreenRecord(draft(over));
    expect(result.record).toBeNull();
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('a floor with no grid to sit on is a blocker', () => {
    const blockers = blockersFor({ gridX: undefined, gridY: undefined, floor: 1 });
    expect(blockers.some((b) => b.includes('grid'))).toBe(true);
  });

  it('a complete draft produces a record and no blockers', () => {
    const result = buildScreenRecord(draft({}));
    expect(result.blockers).toEqual([]);
    expect(result.record).not.toBeNull();
  });
});

describe('buildScreenRecord — fields the form does not own', () => {
  it('carries them across from the record being edited instead of dropping them', () => {
    const existing = {
      id: 'screen-183',
      vanillaName: 'Held Name',
      nav: { edges: [] },
      triggerIds: ['trigger-001'],
      spawns: [{ id: 'spawn-1' }],
    } as unknown as NonNullable<ScreenDraft['existing']>;
    const { record } = buildScreenRecord(draft({ existing }));
    expect(record?.vanillaName).toBe('Held Name');
    expect(record?.nav).toBe(existing.nav);
    expect(record?.triggerIds).toBe(existing.triggerIds);
    expect(record?.spawns).toBe(existing.spawns);
  });

  it('leaves them undefined when there is nothing being edited', () => {
    const { record } = buildScreenRecord(draft({ existing: null }));
    expect(record?.vanillaName).toBeUndefined();
    expect(record?.nav).toBeUndefined();
    expect(record?.triggerIds).toBeUndefined();
    expect(record?.spawns).toBeUndefined();
  });
});
