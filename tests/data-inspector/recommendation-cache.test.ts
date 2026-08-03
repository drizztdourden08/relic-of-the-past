/* @layer tests @kind test */
/**
 * The renderer's read model of the recommendation store.
 *
 * It never merges an edit of its own: a verdict goes to the main process, which
 * owns the file, and what comes back replaces the cached collection wholesale.
 * That is what keeps two accepts fired in quick succession from disagreeing
 * about what the file holds. The flattened snapshot has to be stable between
 * changes as well — it is what `useSyncExternalStore` compares, and a fresh
 * array per read would re-render forever.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as CacheModule from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache';
import type { Recommendation } from '@shared/game/recommendations';

let cache: typeof CacheModule;
let loadRecommendations: ReturnType<typeof vi.fn>;
let decideRecommendation: ReturnType<typeof vi.fn>;

const entry = (id: string, over: Partial<Recommendation> = {}): Recommendation => ({
  id,
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: null,
  proposed: { id: 'tag-001' },
  reason: 'the dataset disagrees',
  detector: 'test',
  evidence: [],
  confidence: 'certain',
  screenId: null,
  origin: 'live',
  state: 'open',
  firstSeenAt: 1,
  decidedAt: null,
  ...over,
} as Recommendation);

const settle = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 0); });

beforeEach(async () => {
  vi.resetModules();
  loadRecommendations = vi.fn().mockResolvedValue([]);
  decideRecommendation = vi.fn().mockResolvedValue([]);
  vi.stubGlobal('window', { api: { loadRecommendations, decideRecommendation } });
  cache = await import('@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loading', () => {
  it('asks for every collection once, however often it is read', async () => {
    cache.allRecommendations();
    cache.allRecommendations();
    await settle();
    cache.allRecommendations();

    const asked = loadRecommendations.mock.calls.map(([kind]) => kind);
    expect(new Set(asked).size).toBe(asked.length);
    expect(asked).toContain('tag');
  });

  it('flattens what came back across collections', async () => {
    loadRecommendations.mockImplementation((kind: string) => Promise.resolve(
      kind === 'tag' ? [entry('r-tag')] : kind === 'item' ? [entry('r-item', { kind: 'item' })] : [],
    ));
    cache.allRecommendations();
    await settle();
    expect(cache.allRecommendations().map(item => item.id).sort()).toEqual(['r-item', 'r-tag']);
  });

  it('treats a failed read as an empty collection rather than throwing', async () => {
    loadRecommendations.mockRejectedValue(new Error('disk error'));
    cache.allRecommendations();
    await settle();
    expect(cache.allRecommendations()).toEqual([]);
  });

  it('hands back the same array until something actually changes', async () => {
    cache.allRecommendations();
    await settle();
    expect(cache.allRecommendations()).toBe(cache.allRecommendations());
  });
});

describe('recording a verdict', () => {
  it('adopts the collection the main process wrote back', async () => {
    cache.ensureRecommendationsLoaded();
    await settle();
    decideRecommendation.mockResolvedValue([entry('r-1', { state: 'dismissed' })]);

    await cache.decideRecommendation('tag', 'r-1', 'dismissed');

    expect(decideRecommendation).toHaveBeenCalledWith('tag', 'r-1', 'dismissed');
    expect(cache.allRecommendations().map(item => item.state)).toEqual(['dismissed']);
  });

  it('tells every viewer, not just the one that decided', async () => {
    const listener = vi.fn();
    cache.subscribeRecommendations(listener);
    decideRecommendation.mockResolvedValue([entry('r-1', { state: 'accepted' })]);

    await cache.decideRecommendation('tag', 'r-1', 'accepted');
    expect(listener).toHaveBeenCalled();
  });

  it('stops telling a viewer that unsubscribed', async () => {
    const listener = vi.fn();
    cache.subscribeRecommendations(listener)();
    await cache.decideRecommendation('tag', 'r-1', 'accepted');
    expect(listener).not.toHaveBeenCalled();
  });
});
