/* @layer renderer-widgets @kind constants */
import type { MouseButton } from '@drizztdourden08/tessera/primitives';
import type { MouseGlyph } from '../sub-components/ControlHint.type';

const MOUSE_OF: Readonly<Record<MouseGlyph, MouseButton>> = {
  'mouse-left': 'left',
  'mouse-right': 'right',
  wheel: 'wheel',
};

export { MOUSE_OF };
