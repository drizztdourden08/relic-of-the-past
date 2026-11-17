/* @layer renderer-components @kind logic */
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';

const shownLanguage = (language: string | null | undefined): string => (language === null || language === undefined || language === '' ? GAME_ROM_LANGUAGE : language);

export { shownLanguage };
