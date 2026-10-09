/* @layer renderer-components @kind constants */
import type { PaintMode } from './PaintField.type';

const KINDS: readonly { value: PaintMode; icon: string; label: string }[] = [
  { value: 'color', icon: '■', label: 'colour (one flat fill)' },
  { value: 'gradient', icon: '◪', label: 'gradient (a ramp between stops)' },
  { value: 'image', icon: '▨', label: 'image (a file, tiled or stretched)' },
];

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

export { HEX_RE, KINDS };
