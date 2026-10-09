/* @layer renderer-components @kind component */
import { Box, StatRow, Text } from '@ds/primitives';
import { DashboardPanel } from '@ds/composites/DashboardGrid';
import { StateChip } from './StateChip';
import type { NetworkSectionProps } from './NetworkSection.type';

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
export type { NetworkSectionProps };
