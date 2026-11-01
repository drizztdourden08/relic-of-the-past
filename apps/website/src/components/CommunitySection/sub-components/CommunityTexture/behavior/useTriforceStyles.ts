/* @layer website-site @kind hook */
import { useMemo } from 'react';
import { TEXTURE_COLUMNS, TEXTURE_ROWS } from '../CommunityTexture.constants';
import type { TriforceStyle } from '../CommunityTexture.type';
import { triforceStyleOf } from './triforce-style-of';

const useTriforceStyles = (): TriforceStyle[] =>
  useMemo(
    () =>
      Array.from({ length: TEXTURE_ROWS * TEXTURE_COLUMNS }, (_, seed) =>
        triforceStyleOf(Math.floor(seed / TEXTURE_COLUMNS), seed % TEXTURE_COLUMNS),
      ),
    [],
  );

export { useTriforceStyles };
