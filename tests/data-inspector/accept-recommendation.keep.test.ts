/* @layer tests @kind test */
/**
 * Accepting a finding routes to the CRUD verb its action names, in a fixed
 * order: write, stamp the review layer, record the verdict. A verdict before
 * the write would mark a finding done that nobody applied, so a refused write
 * leaves both untouched and the finding open.
 *
 * The five collaborators are mocked because each really writes to disk or
 * the recommendation store.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recommendation } from '@shared/game/recommendations';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  write: vi.fn(),
  remove: vi.fn(),
  markWritten: vi.fn(),
  decide: vi.fn(),
}));

vi.mock('@app/ui/domains/app/views/DataInspector/behavior/record-creators', () => ({
  RECORD_CREATORS: { tag: mocks.create },
}));
vi.mock('@app/ui/domains/app/views/DataInspector/behavior/record-writers', () => ({
  RECORD_WRITERS: { tag: mocks.write },
}));
vi.mock('@app/ui/domains/app/views/DataInspector/behavior/delete-record', () => ({
  recordDeleterFor: (kind: string) => (kind === 'tag' ? mocks.remove : undefined),
}));
vi.mock('@app/ui/domains/app/views/DataInspector/behavior/review-store', () => ({
  markWritten: mocks.markWritten,
}));
vi.mock('@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache', () => ({
  decideRecommendation: mocks.decide,
}));

const { acceptRecommendation, dismissRecommendation } = await import(
  '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-recommendation'
);

const finding = (over: Partial<Recommendation> = {}): Recommendation => ({
  id: 'r-1',
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: { id: 'tag-001', value: 'cave' },
  proposed: { id: 'tag-001', value: 'cavern' },
  reason: 'the vocabulary spells it differently',
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

beforeEach(() => {
  mocks.create.mockReset().mockResolvedValue({ success: true, id: 'tag-009' });
  mocks.write.mockReset().mockResolvedValue(undefined);
  mocks.remove.mockReset().mockResolvedValue({ success: true });
  mocks.markWritten.mockReset();
  mocks.decide.mockReset().mockResolvedValue(undefined);
});

describe('acceptRecommendation uses one verb per action', () => {
  it('mints a record for a create, and reports the id that was allocated', async () => {
    const entry = finding({ action: 'create', targetId: null, current: null, proposed: { value: 'cavern' } });
    const outcome = await acceptRecommendation(entry, { value: 'cavern' });

    expect(mocks.create).toHaveBeenCalledWith({ value: 'cavern' });
    expect(mocks.write).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(outcome).toEqual({ success: true, id: 'tag-009' });
  });

  it('replaces the record for an update', async () => {
    await acceptRecommendation(finding(), { id: 'tag-001', value: 'cavern' });

    expect(mocks.write).toHaveBeenCalledWith({ id: 'tag-001', value: 'cavern' });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  // The store reconciles on targetId, so the write is keyed by that identity
  // and not by whatever id the proposal happens to be carrying.
  it('keys an update by the target, not by the id on the proposal', async () => {
    await acceptRecommendation(finding(), { id: 'tag-999', value: 'cavern' });
    expect(mocks.write).toHaveBeenCalledWith({ id: 'tag-001', value: 'cavern' });
  });

  it('removes the record for a delete, ignoring the proposal entirely', async () => {
    await acceptRecommendation(finding({ action: 'delete' }), { id: 'tag-001' });

    expect(mocks.remove).toHaveBeenCalledWith('tag-001');
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it('writes the amended proposal instead of the detector\'s original', async () => {
    await acceptRecommendation(finding(), { id: 'tag-001', value: 'grotto' });
    expect(mocks.write).toHaveBeenCalledWith({ id: 'tag-001', value: 'grotto' });
  });
});

describe('acceptRecommendation closing out', () => {
  it('stamps the review layer and records the verdict once the write lands', async () => {
    await acceptRecommendation(finding(), { id: 'tag-001', value: 'cavern' });
    expect(mocks.markWritten).toHaveBeenCalledWith('tag', 'tag-001');
    expect(mocks.decide).toHaveBeenCalledWith('tag', 'r-1', 'accepted');
  });

  it('stamps the ALLOCATED id after a create, not the absent target', async () => {
    const entry = finding({ action: 'create', targetId: null, current: null, proposed: { value: 'cavern' } });
    await acceptRecommendation(entry, { value: 'cavern' });
    expect(mocks.markWritten).toHaveBeenCalledWith('tag', 'tag-009');
  });

  it('leaves the finding open when the write is refused', async () => {
    mocks.create.mockResolvedValue({ success: false, error: 'no room' });
    const entry = finding({ action: 'create', targetId: null, current: null, proposed: {} });
    const outcome = await acceptRecommendation(entry, {});

    expect(outcome.success).toBe(false);
    expect(outcome.error).toBe('no room');
    expect(mocks.markWritten).not.toHaveBeenCalled();
    expect(mocks.decide).not.toHaveBeenCalled();
  });

  it('reports a thrown write as a failure instead of taking the screen down', async () => {
    mocks.write.mockRejectedValue(new Error('the file is read-only'));
    const outcome = await acceptRecommendation(finding(), { id: 'tag-001' });

    expect(outcome.success).toBe(false);
    expect(outcome.error).toBe('the file is read-only');
    expect(mocks.decide).not.toHaveBeenCalled();
  });

  it('refuses a collection with no write path instead of failing silently', async () => {
    const outcome = await acceptRecommendation(finding({ kind: 'screen' }), { id: 'screen-001' });
    expect(outcome.success).toBe(false);
    expect(outcome.error).toContain('screen');
    expect(mocks.decide).not.toHaveBeenCalled();
  });
});

describe('dismissRecommendation', () => {
  it('records the verdict and writes nothing to the dataset', async () => {
    await dismissRecommendation(finding());
    expect(mocks.decide).toHaveBeenCalledWith('tag', 'r-1', 'dismissed');
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.write).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.markWritten).not.toHaveBeenCalled();
  });
});
