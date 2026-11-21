/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import type { BrockAppSettings } from '@drizztdourden08/brock-react';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';
import { useLanguageGraphicsStore } from '@app/stores/language-graphics-store';

const useLiveSettings = <S extends object>(base: BrockAppSettings<S>): BrockAppSettings<S> => {
  const japaneseGraphics = useJapaneseGraphicsStore((state) => state.available);
  const japanesePieces = useJapaneseGraphicsStore((state) => `${state.menus}${state.pause}${state.ending}`);
  const languagePieces = useLanguageGraphicsStore((state) => `${state.japanese}${Object.values(state.pieces).join('')}`);
  return useMemo(() => ({ ...base, lockCauses: [...(base.lockCauses ?? [])] }), [base, japaneseGraphics, japanesePieces, languagePieces]);
};

export { useLiveSettings };
