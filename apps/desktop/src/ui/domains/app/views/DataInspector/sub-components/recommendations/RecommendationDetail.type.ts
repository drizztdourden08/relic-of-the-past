/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { EntityKind } from '@shared/game/data';
import type { DetailTab, FieldDescriptor, SchemaConfig } from '@drizztdourden08/tessera/data';
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';
import type { PaneScroll } from '../../behavior/recommendations/recommendations.type';

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

export type {
  ComparisonPaneProps,
  ProposalFormProps,
  RecommendationActionsProps,
  RecommendationDetailProps,
  RecommendationSummaryProps,
};
