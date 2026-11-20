/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { TitleSword } from './title-swords.type';

const TITLE_SWORDS: readonly { id: TitleSword; label: Message }[] = [
  { id: 'progress', label: msg('game-labels:title.sword.progress') },
  { id: 'fighter', label: msg('game-labels:title.sword.fighter') },
  { id: 'master', label: msg('game-labels:title.sword.master') },
  { id: 'tempered', label: msg('game-labels:title.sword.tempered') },
  { id: 'golden', label: msg('game-labels:title.sword.golden') },
];

export { TITLE_SWORDS };
