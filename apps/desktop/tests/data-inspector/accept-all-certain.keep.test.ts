/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  acceptAllCertain, certainOnly,
} from '@app/data-inspector/recommendations/accept-all-certain';
import type { Recommendation } from '@rotp/navigation';

const finding = (over: Partial<Recommendation> = {}): Recommendation => ({
  id: 'r-1',
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

const createSourceFile = () => {
  let contents: string[] = [];
  return {
    read: (): string[] => contents,
    apply: async (line: string): Promise<void> => {
      const before = contents;
      await Promise.resolve();
      await Promise.resolve();
      contents = [...before, line];
    },
  };
};

describe('the certainOnly gate', { tags: ['critical'] }, () => {
  it('takes the certain findings and leaves the likely ones', () => {
    const entries = [
      finding({ id: 'sure', confidence: 'certain' }),
      finding({ id: 'maybe', confidence: 'likely' }),
    ];
    expect(certainOnly(entries).map(entry => entry.id)).toEqual(['sure']);
  });

  it('never reopens a finding somebody already decided', () => {
    const entries = [
      finding({ id: 'done', confidence: 'certain', state: 'accepted' }),
      finding({ id: 'no', confidence: 'certain', state: 'dismissed' }),
      finding({ id: 'open', confidence: 'certain', state: 'open' }),
    ];
    expect(certainOnly(entries).map(entry => entry.id)).toEqual(['open']);
  });
});

describe('acceptAllCertain with two findings in one source file', { tags: ['critical'] }, () => {
  const twoInOneFile = [
    finding({ id: 'first', targetId: 'tag-001' }),
    finding({ id: 'second', targetId: 'tag-002' }),
    finding({ id: 'unsure', confidence: 'likely', targetId: 'tag-003' }),
  ];

  it('keeps both edits so the second read sees the first write', async () => {
    const file = createSourceFile();
    const result = await acceptAllCertain(twoInOneFile, async (entry) => {
      await file.apply(entry.id);
      return { success: true, id: entry.targetId ?? '' };
    });

    expect(file.read()).toEqual(['first', 'second']);
    expect(result.accepted).toBe(2);
    expect(result.failures).toEqual([]);
  });

});

describe('acceptAllCertain when a refusal lands mid-run', { tags: ['critical'] }, () => {
  it('carries on and reports what could not be written', async () => {
    const entries = [finding({ id: 'a' }), finding({ id: 'b' }), finding({ id: 'c' })];
    const result = await acceptAllCertain(entries, entry => Promise.resolve(
      entry.id === 'b'
        ? { success: false, reason: 'failed', error: 'no write path' } as const
        : { success: true, id: entry.id } as const,
    ));

    expect(result.accepted).toBe(2);
    expect(result.failures).toEqual([{ id: 'b', error: 'no write path' }]);
  });
});
