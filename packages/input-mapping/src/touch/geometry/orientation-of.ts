/* @layer shared-input @kind logic */
import type { TouchOrientation } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';

/** A box at least as wide as it is tall is landscape. */
const orientationOf = (box: ScreenBox): TouchOrientation => (box.width >= box.height ? 'landscape' : 'portrait');

export { orientationOf };
