/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { EntityKind } from '@rotp/game-data';
import type { DetailTab, FieldDescriptor, SchemaConfig } from '@drizztdourden08/tessera/data';
import type { Recommendation } from '@rotp/navigation';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';
import type { ComparisonScroll, PaneScroll } from '@app/data-inspector/recommendations/recommendations.type';

interface ComparisonPaneProps {
  title: string;
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record?: InspectorRow;
  emptyMessage: string;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  highlightedLines: readonly number[];
  editorSlot: ReactNode;
  scroll: PaneScroll;
}

interface ProposalFormProps {
  kind: EntityKind;
  schema: readonly FieldDescriptor[];
  config?: SchemaConfig;
  record: InspectorRow;
  changedPaths: readonly string[];
  onCommit?: (next: InspectorRow) => Promise<void>;
}

interface RecommendationActionsProps {
  certainCount: number;
  isEdited: boolean;
  busy: boolean;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onRevert: () => void;
  onAcceptAll: () => void;
}

interface RecommendationDetailProps {
  entries: readonly Recommendation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

interface RecommendationSummaryProps {
  entry: Recommendation;
}

interface RecommendationPanesProps {
  kind: EntityKind;
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  current?: InspectorRow;
  proposed: InspectorRow;
  paths: readonly string[];
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onCommit: (next: InspectorRow) => Promise<void>;
  scroll: ComparisonScroll;
}

export type {
  ComparisonPaneProps,
  ProposalFormProps,
  RecommendationActionsProps,
  RecommendationDetailProps,
  RecommendationPanesProps,
  RecommendationSummaryProps,
};
