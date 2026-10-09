/* @layer renderer-components @kind component */
import { Box, StatRow, Text } from '@drizztdourden08/tessera/primitives';
import { DashboardCard } from '../../DashboardCard';
import { StateChip } from './StateChip';
import type { NetworkSectionProps } from './NetworkSection.type';

const NetworkSection = ({ placement, title, chip, rows = [], empty, children }: NetworkSectionProps) => (
  <DashboardCard placement={placement} title={title} actions={chip ? <StateChip {...chip} /> : undefined}>
    {rows === null && empty !== undefined && <Text className="randomizer-page__hint">{empty}</Text>}
    {rows !== null && rows.length > 0 && (
      <Box className="network-tab__rows">
        {rows.map((row) => <StatRow key={row.label} label={row.label} value={row.value} mono />)}
      </Box>
    )}
    {children}
  </DashboardCard>
);

export { NetworkSection };
export type { NetworkSectionProps };
