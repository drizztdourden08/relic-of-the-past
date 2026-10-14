/* @layer renderer-components @kind logic */
import { SECTION_OF_HEAD } from './bound-values.constants';
import type { SectionKey } from './bound-values.type';

const sectionOfPath = (path: string): SectionKey | null => {
  const head = path.split(/[.[]/, 1)[0] ?? '';
  return Object.hasOwn(SECTION_OF_HEAD, head) ? SECTION_OF_HEAD[head] ?? null : null;
};

export { sectionOfPath };
