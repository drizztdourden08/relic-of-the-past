/* @layer renderer-app @kind constants */
import type { JapanesePieces } from '@app/stores/japanese-graphics-store';
import type { LanguagePieceKey } from '@app/stores/language-graphics-store';

const LANGUAGE_GRAPHICS_KEYS: readonly LanguagePieceKey[] = [
  'langMenuScreens', 'langPauseWords', 'langMapLabels', 'langEndingCredits',
];

const JAPANESE_PACK_PIECE: Partial<Record<LanguagePieceKey, keyof JapanesePieces>> = {
  langMenuScreens: 'menus',
  langPauseWords: 'pause',
  langEndingCredits: 'ending',
};

export { JAPANESE_PACK_PIECE, LANGUAGE_GRAPHICS_KEYS };
