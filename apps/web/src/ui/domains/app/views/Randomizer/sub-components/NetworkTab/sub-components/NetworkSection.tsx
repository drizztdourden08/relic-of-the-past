/* @layer renderer-components @kind component */
/**
 * One section of the network tab: a titled panel, an optional chip at the right of the title,
 * then label and value rows, and anything else the section adds below them.
 */
import { Box, SectionHeader, StatRow } from '@ds/primitives';
import { StateChip } from './StateChip';
import type { ReactNode } from 'react';
import type { Chip } from '../behavior/network-tone';

interface NetworkRow {
  label: string;
  value: ReactNode;
}

interface NetworkSectionProps {
  title: string;
  chip?: Chip;
  rows?: readonly NetworkRow[];
  children?: ReactNode;
}

const NetworkSection = ({ title, chip, rows = [], children }: NetworkSectionProps) => (
  <Box className="randomizer-page__panel network-tab__section">
    <SectionHeader title={title} action={chip ? <StateChip {...chip} /> : undefined} />
    {rows.length > 0 && (
      <Box className="network-tab__rows">
        {rows.map((row) => <StatRow key={row.label} label={row.label} value={row.value} mono />)}
      </Box>
    )}
    {children}
  </Box>
);

export { NetworkSection };
export type { NetworkRow, NetworkSectionProps };
