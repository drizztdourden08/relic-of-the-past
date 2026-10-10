/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft,
} from '@app/views/DataInspector/behavior/recommendations/proposal-draft';
import type { Recommendation } from '@rotp/navigation';
import type { TagId, TagRecord } from '@rotp/game-data';

const tagRecord = (id: TagId, value: string) => ({
  id,
  name: `area:${value}`,
  namespace: 'area',
  value,
  label: value,
  namespaceLabel: 'Area',
  appliesTo: ['screen'] as const,
});

const finding = (id: string, proposed: TagRecord): Recommendation => ({
  id,
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: tagRecord('tag-001', 'cave'),
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
});

const ORIGINAL = tagRecord('tag-001', 'cavern');
const AMENDED = tagRecord('tag-001', 'grotto');

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
    const second = finding('r-2', tagRecord('tag-002', 'ledge'));
    const amended = editedDraft(first, AMENDED);

    expect(proposalOf(second, amended)).toEqual(tagRecord('tag-002', 'ledge'));
    expect(isAmended(second, amended)).toBe(false);
  });

  it('is still there when the same finding comes back into view', () => {
    const entry = finding('r-1', ORIGINAL);
    const amended = editedDraft(entry, AMENDED);
    expect(proposalOf(finding('r-1', ORIGINAL), amended)).toEqual(AMENDED);
  });
});
