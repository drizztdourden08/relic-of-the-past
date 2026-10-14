/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { PaintMode } from './PaintField.type';

const KINDS: readonly { value: PaintMode; icon: IconName; label: string }[] = [
  { value: 'color', icon: 'palette', label: 'colour (one flat fill)' },
  { value: 'gradient', icon: 'layers', label: 'gradient (a ramp between stops)' },
  { value: 'image', icon: 'image', label: 'image (a file, tiled or stretched)' },
];

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

export { HEX_RE, KINDS };
