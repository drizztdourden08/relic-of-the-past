/* @layer renderer-widgets @kind component */
import type { ReactNode } from 'react';
import { Text } from '../../../design-system/primitives';

/** Small colored status pill shown in the Dataset widget header. */
const DatasetStatusPill = ({ background, color, children }: { background: string; color: string; children: ReactNode }) => (
  <Text style={{ fontSize: 9, padding: '1px 5px', borderRadius: 'var(--r-sm)', background, color, fontWeight: 600 }}>
    {children}
  </Text>
);

export { DatasetStatusPill };
