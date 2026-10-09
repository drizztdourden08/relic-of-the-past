/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { EntityKind } from '@rotp/game-data';
import type { CollectionSource, DetailTab, FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { NumberBounds, ReferencedByHit } from '@drizztdourden08/tessera/composites';
import type { ScrollPosition } from '@drizztdourden08/tessera/primitives';

type InspectorRow = Record<string, unknown>;

type InspectorSource = CollectionSource<InspectorRow>;

type InspectorKind = EntityKind | 'recommendations';

interface IdRefTarget {
  kind: EntityKind;
  id: string;
  label: string;
}

interface NamedRecord {
  name?: string;
}

type Serializer = (row: InspectorRow) => string;

type RecordWriter = (row: InspectorRow) => Promise<void>;

interface DeleteResult {
  success: boolean;
  error?: string;
}

type RecordDeleter = (id: string) => Promise<DeleteResult>;

type BoundsRule = (path: string, record: unknown) => NumberBounds | undefined;

interface RecordSelection {
  selectedId: string | null;
  selectIn: (kind: InspectorKind, id: string | null) => void;
}

interface DeleteGuardDialogState {
  open: boolean;
  hits: readonly ReferencedByHit[];
  error?: string;
}

type DeleteRoute =
  | { kind: 'immediate' }
  | { kind: 'confirm'; hits: readonly ReferencedByHit[] };

interface CollapsibleDetailProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

interface CreateRecordButtonProps {
  kind: EntityKind;
  label: string;
  schema: readonly FieldDescriptor[];
  onCreated: (id: string) => void;
}

interface DetailTabsProps {
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record?: InspectorRow;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onDeleted?: () => void;
  emptyMessage?: string;
  highlightedLines?: readonly number[];
  editorSlot?: ReactNode;
  onScroll?: (position: ScrollPosition) => void;
  scrollTo?: Partial<ScrollPosition>;
}

interface RecordEditorPanelProps {
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record: InspectorRow;
  onDeleted: () => void;
}

export type {
  BoundsRule,
  CollapsibleDetailProps,
  CreateRecordButtonProps,
  DeleteGuardDialogState,
  DeleteResult,
  DeleteRoute,
  DetailTabsProps,
  IdRefTarget,
  InspectorKind,
  InspectorRow,
  InspectorSource,
  NamedRecord,
  RecordDeleter,
  RecordEditorPanelProps,
  RecordSelection,
  RecordWriter,
  Serializer,
};
