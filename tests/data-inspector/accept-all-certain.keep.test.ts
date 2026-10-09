/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import {
  acceptAllCertain, certainOnly,
} from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/accept-all-certain';
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

describe('the certainOnly gate', () => {
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

describe('acceptAllCertain with two findings in one source file', () => {
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

  it('would lose one of the two if the same writes overlapped', async () => {
    const file = createSourceFile();
    await Promise.all(certainOnly(twoInOneFile).map(entry => file.apply(entry.id)));
    expect(file.read()).toEqual(['second']);
  });

  it('applies them strictly one at a time, never overlapping', async () => {
    let inFlight = 0;
    let overlapped = false;
    await acceptAllCertain(twoInOneFile, async () => {
      inFlight += 1;
      if (inFlight > 1) overlapped = true;
      await Promise.resolve();
      inFlight -= 1;
      return { success: true };
    });
    expect(overlapped).toBe(false);
  });

  it('writes the certain ones and leaves the likely one alone', async () => {
    const accept = vi.fn().mockResolvedValue({ success: true });
    await acceptAllCertain(twoInOneFile, accept);
    expect(accept.mock.calls.map(([entry]) => (entry as Recommendation).id)).toEqual(['first', 'second']);
  });
});

describe('acceptAllCertain when a refusal lands mid-run', () => {
  it('carries on and reports what could not be written', async () => {
    const entries = [finding({ id: 'a' }), finding({ id: 'b' }), finding({ id: 'c' })];
    const result = await acceptAllCertain(entries, entry => Promise.resolve(
      entry.id === 'b' ? { success: false, error: 'no write path' } : { success: true },
    ));

    expect(result.accepted).toBe(2);
    expect(result.failures).toEqual([{ id: 'b', error: 'no write path' }]);
  });
});
