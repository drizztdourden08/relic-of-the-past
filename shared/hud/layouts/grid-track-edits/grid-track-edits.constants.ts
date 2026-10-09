/* @layer shared-hud @kind constants */
import type { TrackAxis } from './grid-track-edits.type';

const START: Record<TrackAxis, 'column' | 'row'> = { columns: 'column', rows: 'row' };
const SPAN: Record<TrackAxis, 'colSpan' | 'rowSpan'> = { columns: 'colSpan', rows: 'rowSpan' };

export { SPAN, START };
