/* @layer shared-game @kind constants */
import type { TitleSword } from './title-swords.type';

const TITLE_SWORDS: readonly { id: TitleSword; label: string }[] = [
  { id: 'progress', label: 'Progress' },
  { id: 'fighter', label: 'Fighter' },
  { id: 'master', label: 'Master' },
  { id: 'tempered', label: 'Tempered' },
  { id: 'golden', label: 'Golden' },
];

export { TITLE_SWORDS };
