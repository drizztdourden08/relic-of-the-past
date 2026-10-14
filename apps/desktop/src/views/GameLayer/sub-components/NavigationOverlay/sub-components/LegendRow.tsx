/* @layer renderer-components @kind component */
import type { ReactNode } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';

const LegendRow = ({ children }: { children: ReactNode }) => <Box className="nav-legend__row">{children}</Box>;

export { LegendRow };
