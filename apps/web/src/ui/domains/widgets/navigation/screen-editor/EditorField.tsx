/* @layer renderer-widgets @kind component */
import type { ReactNode } from 'react';
import { Box, Text } from '../../../../design-system/primitives';

/**
 * A labeled field wrapper used throughout the screen-editor form. The class
 * parametrizes it across the three shapes that recur in the editor: a full
 * row (`screen-editor__row`), a locked row, and a bare half-row cell (no class).
 */
const EditorField = ({ label, className, children }: { label?: ReactNode; className?: string; children: ReactNode }) => (
  <Box className={className}>
    {label != null && <Text as="label">{label}</Text>}
    {children}
  </Box>
);

export { EditorField };
