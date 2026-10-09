/* @layer renderer-app @kind types */
import type { EntityKind } from '@rotp/game-data';
import type { Confidence, Recommendation, RecommendationAction } from '@shared/game/recommendations';
import type { ScrollPosition } from '@drizztdourden08/tessera/primitives';
import type { InspectorRow } from '../../DataInspector.type';

interface BatchResult {
  accepted: number;
  skipped: readonly { id: string; reason: string }[];
  failures: readonly { id: string; error: string }[];
}

interface AcceptWritten {
  success: true;
  id: string;
}

interface AcceptRefused {
  success: false;
  reason: 'needs-form' | 'failed';
  error: string;
}

type AcceptOutcome = AcceptWritten | AcceptRefused;

interface ProposalDraft {
  forId: string | null;
  record: InspectorRow | null;
}

interface RecommendationRow {
  id: string;
  kind: string;
  action: RecommendationAction;
  targetId: string | null;
  reason: string;
  confidence: Confidence;
  screenId: string | null;
  firstSeenAt: string;
}

interface RecommendationStore {
  cache: Map<EntityKind, readonly Recommendation[]>;
  loading: Set<EntityKind>;
  listeners: Set<() => void>;
  flattened: readonly Recommendation[];
}

type PaneSide = 'current' | 'proposed';

interface PaneScroll {
  onScroll: (position: ScrollPosition) => void;
  scrollTo: Partial<ScrollPosition> | undefined;
}

interface ComparisonScroll {
  current: PaneScroll;
  proposed: PaneScroll;
}

interface Lead {
  side: PaneSide;
  position: ScrollPosition;
}

interface ReviewParams {
  entries: readonly Recommendation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export type {
  AcceptOutcome,
  AcceptRefused,
  AcceptWritten,
  BatchResult,
  ComparisonScroll,
  Lead,
  PaneScroll,
  PaneSide,
  ProposalDraft,
  RecommendationRow,
  RecommendationStore,
  ReviewParams,
};
