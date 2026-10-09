/* @layer renderer-components @kind constants */
import type { SectionId } from './insert-menu.type';

const SECTION_OF_CODE: Record<string, SectionId> = {
  Name: 'values',
  Number: 'values',
  Waitkey: 'pacing',
  Wait: 'pacing',
  Speed: 'pacing',
  '1': 'layout',
  '2': 'layout',
  '3': 'layout',
  Scroll: 'layout',
};

const CODE_ORDER = ['Name', 'Number', 'Waitkey', 'Wait', 'Speed', '1', '2', '3', 'Scroll'];

const BRACKETED = /^\[([^\]]+)\]$/;

export { BRACKETED, CODE_ORDER, SECTION_OF_CODE };
