/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { BlockDoc, DialogueEntry, EntryIssue, RowFit, Token, VariableIndex } from '@shared/game/language';
import type { DialogueContext, TriggerSourceRow } from '@shared/game/data/dialogue-context';
import type { EntryLayout, EntryViewMode } from '../../behavior/language-behavior.type';

type MetaRow = {
  key: string;
  label: string;
  value: string;
  mono?: boolean;
  absent?: boolean;
};

type TriggerFacts = {
  by: TriggerSourceRow['by'] | null;
  who: string;
  where: string;
  nativeKey: string;
  alsoNames: string[];
  citation: string;
};

type MetaParams = {
  tokens: Token[];
  facts: TriggerFacts;
  context: DialogueContext | null;
  blocks: BlockDoc;
  lineCount: number;
  variables: VariableIndex;
};

type EntryRowModel = {
  id: number;
  idLabel: string;
  who: string;
  trigger: string;
  size: string;
  choice: string;
  choiceDetail: string;
  excerpt: string;
  issues: string[];
};

type EntryRowParams = {
  entry: DialogueEntry;
  blocks: BlockDoc;
  lineCount: number;
  variables: VariableIndex;
  issues?: EntryIssue[];
};

type EntryTally = {
  insertsName: boolean;
  digits: number;
  terms: string[];
  waits: number;
  pauses: number;
};

type FitChip = {
  label: string;
  variant: 'success' | 'warning' | 'danger';
  detail: string;
};

type EntryCardCollapsedProps = {
  model: EntryRowModel;
  rows: RowFit[];
  onOpen: (id: number) => void;
};

type EntryListItemProps = {
  entry: DialogueEntry;
  layout: EntryLayout;
  variables: VariableIndex;
  issues?: EntryIssue[];
  open: boolean;
  mode: EntryViewMode;
  modes?: readonly EntryViewMode[];
  editor?: ReactNode;
  preview?: ReactNode;
  onOpen: (id: number) => void;
  onClose: (id: number) => void;
  onModeChange: (id: number, mode: EntryViewMode) => void;
};

type EntryMetaPanelProps = {
  rows: MetaRow[];
  issues: string[];
};

type EntryPanelProps = {
  idLabel: string;
  who: string;
  metaRows: MetaRow[];
  issues: string[];
  mode: EntryViewMode;
  modes?: readonly EntryViewMode[];
  onModeChange: (mode: EntryViewMode) => void;
  onClose: () => void;
  children: ReactNode;
};

type ReadViewProps = {
  prose: string;
  note?: string;
};

type ViewModeSwitchProps = {
  value: EntryViewMode;
  modes?: readonly EntryViewMode[];
  onChange: (mode: EntryViewMode) => void;
};

export type {
  EntryCardCollapsedProps, EntryListItemProps, EntryMetaPanelProps, EntryPanelProps, EntryRowModel, EntryRowParams, EntryTally, FitChip, MetaParams,
  MetaRow, ReadViewProps, TriggerFacts, ViewModeSwitchProps,
};
