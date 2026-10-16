/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuManagerModel } from '../msu-manager.type';
import type { PackFormat } from '../msu.type';
import type { StudioTab } from '../sound-labels';

type StudioStatusProps = {
  format: PackFormat;
  readOnly: boolean;
};

type StudioNoticesProps = {
  message: string | null;
  ok: boolean;
};

type PackPropertiesProps = {
  pack: string;
  format: PackFormat;
  slotCount: number;
  fileCount: number;
  totalSize: number;
  isDeluxe: boolean;
  hasOpuz: boolean;
  busy: boolean;
  readOnly: boolean;
  onRename: (name: string) => void;
};

type EditorBodyProps = {
  hasPack: boolean;
  loading: boolean;
  children: ReactNode;
};

type TabPanelsProps = {
  msu: MsuManagerModel;
  pack: string;
  readOnly: boolean;
  tab: StudioTab;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
};

export type { EditorBodyProps, PackPropertiesProps, StudioNoticesProps, StudioStatusProps, TabPanelsProps };
