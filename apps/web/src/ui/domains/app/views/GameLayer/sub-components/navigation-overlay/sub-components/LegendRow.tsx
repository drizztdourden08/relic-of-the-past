/* @layer renderer-components @kind component */
import type { CSSProperties, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';

const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 5 };

const LegendRow = ({ children }: { children: ReactNode }) => <Box style={rowStyle}>{children}</Box>;

export { LegendRow };
