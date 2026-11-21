/* @layer renderer-stores @kind types */
type LanguagePieceKey = 'langMenuScreens' | 'langPauseWords' | 'langMapLabels' | 'langEndingCredits';

type Sized = { readonly length: number } | undefined;

type LanguagePieces = Record<LanguagePieceKey, boolean>;

interface LanguageGraphicsAvailability {
  pieces: LanguagePieces;
  japanese: boolean;
}

interface LanguageGraphicsStore extends LanguageGraphicsAvailability {
  setAvailability: (availability: LanguageGraphicsAvailability) => void;
}

export type { LanguageGraphicsAvailability, LanguageGraphicsStore, LanguagePieceKey, Sized };
