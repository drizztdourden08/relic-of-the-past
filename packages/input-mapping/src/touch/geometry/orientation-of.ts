/* @layer shared-input @kind logic */
import type { TouchOrientation } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';

const orientationOf = (box: ScreenBox): TouchOrientation => (box.width >= box.height ? 'landscape' : 'portrait');

export { orientationOf };
