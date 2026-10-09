/* @layer renderer-components @kind component */
import type { CSSProperties, ReactNode } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';

const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 5 };

const LegendRow = ({ children }: { children: ReactNode }) => <Box style={rowStyle}>{children}</Box>;

export { LegendRow };
