/* @layer renderer-stores @kind types */
import type { ViewKey } from '@ds/data';
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';

interface PendingRecord {
  kind: EntityKind;
  id: string;
}

interface SessionView {
  scrollTop: number;
  expanded: readonly string[];
  selectedId: string | null;
  draft?: unknown;
}

interface DataViewStoreState {
  views: Partial<Record<ViewKey, SessionView>>;
  getSessionView: (key: ViewKey) => SessionView;
  setSessionView: (key: ViewKey, view: SessionView) => void;
  clearSessionView: (key: ViewKey) => void;

  pendingRecommendation: Recommendation | null;
  openRecommendation: (recommendation: Recommendation) => void;
  clearPendingRecommendation: () => void;

  pendingRecord: PendingRecord | null;
  openRecord: (kind: EntityKind, id: string) => void;
  clearPendingRecord: () => void;

  registerInspectorOpener: (open: (() => void) | null) => void;
}

export type { DataViewStoreState, PendingRecord, SessionView };
