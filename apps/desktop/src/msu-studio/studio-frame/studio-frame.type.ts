/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { MsuManagerModel } from '../msu-manager.type';
import type { PackFormat } from '../msu.type';
import type { StudioTab } from '../sound-labels';

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

type SectionTabsProps = {
  tab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
};

type TabPanelsProps = {
  msu: MsuManagerModel;
  pack: string;
  readOnly: boolean;
  tab: StudioTab;
  tabs: ReactNode;
  packPanel: ReactNode;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
};

export type { PackPropertiesProps, SectionTabsProps, StudioNoticesProps, TabPanelsProps };
