/* @layer renderer-components @kind component */
/**
 * One panel of the network tab: a dashboard panel at its place on the grid, an optional chip
 * at the right of the title, then label and value rows, and anything else the panel adds below
 * them. With nothing to show (`rows` null), it says why in one line.
 */
import { Box, StatRow, Text } from '@ds/primitives';
import { DashboardPanel } from '@ds/composites/DashboardGrid';
import { StateChip } from './StateChip';
import type { ReactNode } from 'react';
import type { Chip } from '../behavior/network-tone';
import type { PanelPlacement } from '../../../Randomizer.constants';

interface NetworkRow {
  label: string;
  value: ReactNode;
}

interface NetworkSectionProps {
  placement: PanelPlacement;
  title: string;
  chip?: Chip;
  /** Null when the panel has no picture to draw; `empty` then says why. */
  rows?: readonly NetworkRow[] | null;
  empty?: string;
  children?: ReactNode;
}

const NetworkSection = ({ placement, title, chip, rows = [], empty, children }: NetworkSectionProps) => (
  <DashboardPanel {...placement} title={title} action={chip ? <StateChip {...chip} /> : undefined}>
    {rows === null && empty !== undefined && <Text className="randomizer-page__hint">{empty}</Text>}
    {rows !== null && rows.length > 0 && (
      <Box className="network-tab__rows">
        {rows.map((row) => <StatRow key={row.label} label={row.label} value={row.value} mono />)}
      </Box>
    )}
    {children}
  </DashboardPanel>
);

export { NetworkSection };
export type { NetworkRow, NetworkSectionProps };
