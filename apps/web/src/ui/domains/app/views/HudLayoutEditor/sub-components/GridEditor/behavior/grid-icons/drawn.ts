/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';

const drawn = (shapes: string): IconifyIcon => ({
  width: 24,
  height: 24,
  body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">${shapes}</g>`,
});

export { drawn };
