/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import type { SpriteCategory } from '@rotp/game-data';
import { SPRITE_CATEGORY_MESSAGES } from './sprite-category-labels.constants';

const useSpriteCategoryLabels = (): Record<SpriteCategory, string> => {
  const text = useText();
  return useMemo(
    () => Object.fromEntries(Object.entries(SPRITE_CATEGORY_MESSAGES).map(([category, message]) => [category, text(message)])) as Record<SpriteCategory, string>,
    [text],
  );
};

export { useSpriteCategoryLabels };
