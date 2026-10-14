/* @layer renderer-components @kind constants */
import type { SectionKey } from './bound-values.type';

const NESTED_NODE_KEYS = new Set(['child', 'node', 'otherwise', 'children']);

const SECTION_OF_HEAD: Readonly<Record<string, SectionKey | undefined>> = {
  gap: 'layout',
  columns: 'layout',
  rows: 'layout',
  size: 'sizeBox',
  min: 'sizeBox',
  max: 'sizeBox',
  scale: 'sizeBox',
  opacity: 'appearance',
  visible: 'appearance',
  style: 'appearance',
  element: 'content',
  animation: 'animation',
  transition: 'transitions',
};

export { NESTED_NODE_KEYS, SECTION_OF_HEAD };
