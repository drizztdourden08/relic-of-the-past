/* @layer renderer-app @kind component */
import type { ReactNode } from 'react';
import { Box, Text } from '../../../../../design-system/primitives';

/** A labeled example block inside the storybook canvas. */
const Specimen = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <Box className="dg-specimen">
    <Box className="dg-specimen__head">
      <Text className="dg-specimen__label">{label}</Text>
      {hint && <Text className="dg-specimen__hint">{hint}</Text>}
    </Box>
    <Box className="dg-specimen__demo">{children}</Box>
  </Box>
);

export { Specimen };
