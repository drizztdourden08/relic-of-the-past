/* @layer renderer-stores @kind logic */
import type { LanguageSet } from '@rotp/languages';
import { NO_LANGUAGE_GRAPHICS } from './language-graphics.constants';
import type { LanguageGraphicsAvailability, Sized } from './language-graphics-store.type';

const filled = (...parts: Sized[]): boolean => parts.some((part) => part !== undefined && part.length > 0);

const filledRecord = (record: Readonly<Record<string, Sized>> | undefined): boolean =>
  record !== undefined && Object.values(record).some((part) => filled(part));

const languageAvailabilityOf = (set: LanguageSet | null | undefined): LanguageGraphicsAvailability => {
  if (!set) return NO_LANGUAGE_GRAPHICS;
  const japanese = set.script === 'japanese';
  const s = set.screens;
  if (!s) return { pieces: NO_LANGUAGE_GRAPHICS.pieces, japanese };
  return {
    japanese,
    pieces: {
      langMenuScreens: filledRecord(s.selectFileStripes) || filled(s.nameGrid, s.menuTilemaps),
      langPauseWords: filledRecord(s.pauseText) || filled(s.pauseHeaders),
      langMapLabels: filled(s.dungeonMapLabels, s.floorLabels),
      langEndingCredits: filled(s.endingCaptions.data, s.credits.text),
    },
  };
};

export { languageAvailabilityOf };
