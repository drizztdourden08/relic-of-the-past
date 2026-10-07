/* @layer tests @kind test */
/**
 * The create-flow's write half: one adapter per collection's `Allocate*`
 * shape. Each folds the record into the live registry, publishes it as an
 * id-ref option, and rebuilds the `CollectionSource`.
 */
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { all } from '@shared/game/data';
import { RECORD_CREATORS } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-creators';
import { COLLECTION_SOURCES } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';

const stubApi = () => ({
  allocateTag: vi.fn(),
  allocateItemGroup: vi.fn(),
  allocateEnumeration: vi.fn(),
  allocateGeography: vi.fn(),
  allocateCheck: vi.fn(),
});

let api: ReturnType<typeof stubApi>;

beforeEach(() => {
  api = stubApi();
  vi.stubGlobal('window', { api: { screenEditor: api } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createTagRecord', () => {
  const creator = RECORD_CREATORS.tag!;

  it('refuses a namespace/value pair that would not read namespace:value', async () => {
    const result = await creator({ namespace: '', value: 'outdoor', appliesTo: ['screen'] });
    expect(result).toEqual({ success: false, error: expect.stringContaining('namespace:value') });
    expect(api.allocateTag).not.toHaveBeenCalled();
  });

  it('mints a term, folds it into the registry, and publishes it as a pickable option', async () => {
    const record = {
      id: 'tag-900', name: 'test:brand-new', namespace: 'test', value: 'brand-new',
      label: 'Brand new', namespaceLabel: 'Test', appliesTo: ['screen'],
    };
    api.allocateTag.mockResolvedValue({ success: true, record });
    const before = all('tag').length;

    const result = await creator({ namespace: 'test', value: 'brand-new', label: 'Brand new', appliesTo: ['screen'] });

    expect(result).toEqual({ success: true, id: 'tag-900' });
    expect(api.allocateTag).toHaveBeenCalledWith({
      key: 'test:brand-new', appliesTo: ['screen'], label: 'Brand new', namespaceLabel: undefined,
    });
    expect(all('tag').length).toBe(before + 1);
    expect(all('tag').some((tag) => tag.id === 'tag-900')).toBe(true);
    expect(resolveIdRefOptionsFor('tag', { path: 'x', label: 'x', kind: 'idRef', optional: false })
      .some((option) => option.value === 'tag-900')).toBe(true);
    expect(COLLECTION_SOURCES.tag.rows.some((row) => row.id === 'tag-900')).toBe(true);
  });

  it('surfaces the main process\'s own refusal (e.g. a duplicate key) unchanged', async () => {
    api.allocateTag.mockResolvedValue({ success: false, error: 'The tag test:brand-new already exists.' });
    const result = await creator({ namespace: 'test', value: 'brand-new', appliesTo: ['screen'] });
    expect(result).toEqual({ success: false, error: 'The tag test:brand-new already exists.' });
  });
});

describe('createItemGroupRecord', () => {
  const creator = RECORD_CREATORS['item-group']!;

  it('mints a group and folds it into the registry', async () => {
    const record = { id: 'ig-900', label: 'Bottles', memberIds: ['item-001'] };
    api.allocateItemGroup.mockResolvedValue({ success: true, record });
    const before = all('item-group').length;

    const result = await creator({ label: 'Bottles', memberIds: ['item-001'] });

    expect(result).toEqual({ success: true, id: 'ig-900' });
    expect(api.allocateItemGroup).toHaveBeenCalledWith({ label: 'Bottles', memberIds: ['item-001'] });
    expect(all('item-group').length).toBe(before + 1);
    expect(COLLECTION_SOURCES['item-group'].rows.some((row) => row.id === 'ig-900')).toBe(true);
  });
});

describe('a record-facade collection (check)', () => {
  const creator = RECORD_CREATORS.check!;

  it('sends the whole draft as the record and folds the allocated result back in', async () => {
    const record = { id: 'check-900', gameId: {}, kind: 'event', randomizerName: 'A brand-new check', vanillaItemIds: [] };
    api.allocateCheck.mockResolvedValue({ success: true, record });
    const before = all('check').length;

    const result = await creator({ gameId: {}, kind: 'event', randomizerName: 'A brand-new check', vanillaItemIds: [] });

    expect(result).toEqual({ success: true, id: 'check-900' });
    expect(all('check').length).toBe(before + 1);
    expect(COLLECTION_SOURCES.check.rows.some((row) => row.id === 'check-900')).toBe(true);
  });

  it('reports a refused allocation as a plain failure, with nothing folded in', async () => {
    api.allocateCheck.mockResolvedValue({ success: false, error: 'nope' });
    const before = all('check').length;

    const result = await creator({ gameId: {}, kind: 'event', randomizerName: 'x', vanillaItemIds: [] });

    expect(result).toEqual({ success: false, error: 'nope' });
    expect(all('check').length).toBe(before);
  });
});
