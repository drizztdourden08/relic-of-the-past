/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';
import { useLanguageGraphicsStore } from '@app/stores/language-graphics-store';
import type { LanguagePieceKey } from '@app/stores/language-graphics-store';
import { JAPANESE_PACK_PIECE, LANGUAGE_GRAPHICS_KEYS } from './language-graphics-keys.constants';

const causeOfPiece = (key: LanguagePieceKey): 'languageGraphics' | 'japaneseGraphics' | null => {
  const { pieces, japanese } = useLanguageGraphicsStore.getState();
  const packPiece = JAPANESE_PACK_PIECE[key];
  if (japanese && packPiece && !useJapaneseGraphicsStore.getState()[packPiece]) return 'japaneseGraphics';
  if (japanese && packPiece && key !== 'langMenuScreens') return null;
  return pieces[key] ? null : 'languageGraphics';
};

const languageGraphicsLockProvider: LockCauseProvider<GameSettings> = {
  id: 'languageGraphics',
  order: LOCK_CAUSE_ORDER.developer,
  causeOf: (key) => (LANGUAGE_GRAPHICS_KEYS.includes(key as LanguagePieceKey) ? causeOfPiece(key as LanguagePieceKey) : null),
};

export { languageGraphicsLockProvider };
