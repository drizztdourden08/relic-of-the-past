/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import type { BrockAppSettings } from '@drizztdourden08/brock-react';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';

const useLiveSettings = <S extends object>(base: BrockAppSettings<S>): BrockAppSettings<S> => {
  const japaneseGraphics = useJapaneseGraphicsStore((state) => state.available);
  return useMemo(() => ({ ...base, lockCauses: [...(base.lockCauses ?? [])] }), [base, japaneseGraphics]);
};

export { useLiveSettings };
