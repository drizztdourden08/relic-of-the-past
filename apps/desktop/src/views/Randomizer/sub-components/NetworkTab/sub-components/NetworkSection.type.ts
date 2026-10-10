/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { Chip } from '../behavior/network-tone.type';
import type { PanelPlacement } from '../../../Randomizer.type';

interface NetworkRow {
  label: string;
  value: ReactNode;
}

interface NetworkSectionProps {
  placement: PanelPlacement;
  title: string;
  chip?: Chip;
  rows?: readonly NetworkRow[] | null;
  empty?: string;
  children?: ReactNode;
}

export type { NetworkRow, NetworkSectionProps };
