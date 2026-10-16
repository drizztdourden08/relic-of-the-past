/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';

const sectionGroup = (tabs: ReactNode): ToolGroup => ({ id: 'section', label: 'Section', content: tabs });

export { sectionGroup };
