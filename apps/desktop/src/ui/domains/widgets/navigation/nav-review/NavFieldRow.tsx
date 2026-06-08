/* @layer renderer-widgets @kind component */
import type { ReactNode } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from './nav-review-styles';

/** A label/value row inside a nav-review point body. */
const NavFieldRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box style={S.fieldRow}>
    <Text style={S.fieldLabel}>{label}</Text>
    <Text style={S.fieldValue}>{children}</Text>
  </Box>
);

export { NavFieldRow };
