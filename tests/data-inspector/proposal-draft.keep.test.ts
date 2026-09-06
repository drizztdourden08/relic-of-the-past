/* @layer tests @kind test */
/**
 * Revert, and the state it reverts. A reviewer may amend a proposal before
 * accepting, so the comparison view keeps an editable copy that must never
 * reach the store (a re-detection would collide with a half-made edit).
 * Revert is not an undo history: it drops the amendment. The amendment is
 * keyed to its finding, so selecting another drops it with no clean-up step.
 */
import { describe, it, expect } from 'vitest';
import {
  NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft,
} from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/proposal-draft';
import type { Recommendation } from '@shared/game/recommendations';

const finding = (id: string, proposed: Record<string, unknown>): Recommendation => ({
  id,
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: { id: 'tag-001', value: 'cave' },
  proposed,
  reason: 'the vocabulary spells it differently',
  detector: 'test',
  evidence: [],
  confidence: 'certain',
  screenId: null,
  origin: 'live',
  state: 'open',
  firstSeenAt: 1,
  decidedAt: null,
} as Recommendation);

const ORIGINAL = { id: 'tag-001', value: 'cavern' };
const AMENDED = { id: 'tag-001', value: 'grotto' };

describe('the proposal shown', () => {
  it('is the detector\'s own draft until anybody edits it', () => {
    expect(proposalOf(finding('r-1', ORIGINAL), NO_DRAFT)).toEqual(ORIGINAL);
  });

  it('is the amendment once there is one', () => {
    const entry = finding('r-1', ORIGINAL);
    expect(proposalOf(entry, editedDraft(entry, AMENDED))).toEqual(AMENDED);
  });

  it('is nothing when no finding is open', () => {
    expect(proposalOf(null, NO_DRAFT)).toBeNull();
  });
});

describe('revert', () => {
  it('restores the detector\'s original draft', () => {
    const entry = finding('r-1', ORIGINAL);
    const amended = editedDraft(entry, AMENDED);
    expect(proposalOf(entry, amended)).toEqual(AMENDED);
    expect(proposalOf(entry, revertedDraft())).toEqual(ORIGINAL);
  });

  it('never mutates what the detector recorded', () => {
    const entry = finding('r-1', ORIGINAL);
    editedDraft(entry, AMENDED);
    expect(entry.proposed).toEqual(ORIGINAL);
  });

  it('leaves the finding unamended afterwards', () => {
    const entry = finding('r-1', ORIGINAL);
    expect(isAmended(entry, editedDraft(entry, AMENDED))).toBe(true);
    expect(isAmended(entry, revertedDraft())).toBe(false);
  });
});

describe('an amendment belongs to one finding', () => {
  it('does not carry over to the next one selected', () => {
    const first = finding('r-1', ORIGINAL);
    const second = finding('r-2', { id: 'tag-002', value: 'ledge' });
    const amended = editedDraft(first, AMENDED);

    expect(proposalOf(second, amended)).toEqual({ id: 'tag-002', value: 'ledge' });
    expect(isAmended(second, amended)).toBe(false);
  });

  it('is still there when the same finding comes back into view', () => {
    const entry = finding('r-1', ORIGINAL);
    const amended = editedDraft(entry, AMENDED);
    expect(proposalOf(finding('r-1', ORIGINAL), amended)).toEqual(AMENDED);
  });
});
