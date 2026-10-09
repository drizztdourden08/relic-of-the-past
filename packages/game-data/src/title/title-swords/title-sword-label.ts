/* @layer shared-game @kind logic */
import type { TitleSword } from './title-swords.type';
import { TITLE_SWORDS } from './title-swords.constants';

const titleSwordLabel = (id: TitleSword): string => TITLE_SWORDS.find((s) => s.id === id)?.label ?? id;

export { titleSwordLabel };
