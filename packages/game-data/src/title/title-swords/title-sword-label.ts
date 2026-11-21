/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { TitleSword } from './title-swords.type';
import { TITLE_SWORDS } from './title-swords.constants';

const titleSwordLabel = (id: TitleSword): Text => TITLE_SWORDS.find((s) => s.id === id)?.label ?? id;

export { titleSwordLabel };
