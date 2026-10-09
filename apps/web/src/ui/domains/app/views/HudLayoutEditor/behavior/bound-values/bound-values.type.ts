/* @layer renderer-components @kind types */
interface BoundValue { path: string; expr: string }

type SectionKey = 'layout' | 'sizeBox' | 'appearance' | 'content' | 'animation' | 'transitions';

export type { BoundValue, SectionKey };
