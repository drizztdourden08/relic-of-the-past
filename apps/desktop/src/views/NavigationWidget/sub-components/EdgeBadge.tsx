/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { EDGE_COLOR_BY_SIDE } from '../NavigationWidget.constants';
import type { EdgeBadgeProps } from './EdgeBadge.type';

const textColor = (edge: string) => (edge === 'north' || edge === 'west' ? 'var(--c-text)' : '#000');

const EdgeBadge = ({ connection, box, title }: EdgeBadgeProps) => (
  <Box style={{ position: 'absolute', ...box, borderRadius: 'var(--radius-sm)', background: EDGE_COLOR_BY_SIDE[connection.edge], display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    title={title}>
    <Text style={{ fontSize: 9, fontWeight: 700, color: textColor(connection.edge), lineHeight: 1 }}>{connection.positions.length}</Text>
  </Box>
);

export { EdgeBadge };
