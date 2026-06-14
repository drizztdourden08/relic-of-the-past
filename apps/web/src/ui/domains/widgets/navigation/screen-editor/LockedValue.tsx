/* @layer renderer-widgets @kind component */
import type { ReactNode } from 'react';
import { Text } from '../../../../design-system/primitives';

/** Read-only derived value shown in a locked screen-editor row. */
const LockedValue = ({ children }: { children: ReactNode }) => (
  <Text className="screen-editor__locked-value">{children}</Text>
);

export { LockedValue };
