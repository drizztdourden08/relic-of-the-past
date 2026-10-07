/* @layer tests @kind test */
/**
 * `openRecommendation` is the one call anything outside this screen makes to get
 * a finding on screen. Neither side can reach the other: the shell owns page
 * state as local React state, a widget owns none. The shell registers how to
 * bring the inspector forward, the caller hands over what to show, the view
 * consumes the request once landed. The registration itself is the shell's
 * `useAppNavigation` effect.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { Recommendation } from '@shared/game/recommendations';

const finding = (id: string): Recommendation => ({
  id,
  kind: 'tag',
  action: 'update',
  targetId: 'tag-001',
  current: null,
  proposed: { id: 'tag-001' },
  reason: 'the live game disagrees',
  detector: 'test',
  evidence: [],
  confidence: 'certain',
  screenId: null,
  origin: 'live',
  state: 'open',
  firstSeenAt: 1,
  decidedAt: null,
} as Recommendation);

beforeEach(() => {
  useDataViewStore.getState().registerInspectorOpener(null);
  useDataViewStore.getState().clearPendingRecommendation();
});

describe('openRecommendation', () => {
  it('leaves the finding standing for the view to pick up', () => {
    const entry = finding('r-1');
    useDataViewStore.getState().openRecommendation(entry);
    expect(useDataViewStore.getState().pendingRecommendation).toBe(entry);
  });

  it('brings the inspector page to the front through the shell it registered', () => {
    const open = vi.fn();
    useDataViewStore.getState().registerInspectorOpener(open);
    useDataViewStore.getState().openRecommendation(finding('r-2'));
    expect(open).toHaveBeenCalledTimes(1);
  });

  // Order matters: a shell that renders the inspector synchronously must find
  // the request already stored by the time it mounts.
  it('stores the request before it opens the page', () => {
    let seen: string | null = null;
    useDataViewStore.getState().registerInspectorOpener(() => {
      seen = useDataViewStore.getState().pendingRecommendation?.id ?? null;
    });
    useDataViewStore.getState().openRecommendation(finding('r-3'));
    expect(seen).toBe('r-3');
  });

  it('still records the request when no shell has registered', () => {
    expect(() => useDataViewStore.getState().openRecommendation(finding('r-4'))).not.toThrow();
    expect(useDataViewStore.getState().pendingRecommendation?.id).toBe('r-4');
  });

  it('is spent once the view has consumed it', () => {
    useDataViewStore.getState().openRecommendation(finding('r-5'));
    useDataViewStore.getState().clearPendingRecommendation();
    expect(useDataViewStore.getState().pendingRecommendation).toBeNull();
  });

  it('replaces an unconsumed request instead of queueing behind it', () => {
    useDataViewStore.getState().openRecommendation(finding('first'));
    useDataViewStore.getState().openRecommendation(finding('second'));
    expect(useDataViewStore.getState().pendingRecommendation?.id).toBe('second');
  });

  it('withdraws the opener when the shell unmounts', () => {
    const open = vi.fn();
    useDataViewStore.getState().registerInspectorOpener(open);
    useDataViewStore.getState().registerInspectorOpener(null);
    useDataViewStore.getState().openRecommendation(finding('r-6'));
    expect(open).not.toHaveBeenCalled();
  });

  // The opener is deliberately NOT store state: re-registering it must not
  // notify anything subscribed to the views slice.
  it('does not re-render subscribers when the shell re-registers', () => {
    const listener = vi.fn();
    const unsubscribe = useDataViewStore.subscribe(listener);
    useDataViewStore.getState().registerInspectorOpener(() => {});
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });
});
