/* @layer renderer-hooks @kind logic */
import { useEffect, useState } from 'react';
import { useAnimationClock } from '../../../behavior/useAnimationClock';
import { BUNNY_ACTION, DEFAULT_SCALE } from '../SpriteSheetViewer.constants';
import type { SheetView, SpriteViewerParams } from '../SpriteSheetViewer.type';

const useSpriteViewer = (params: SpriteViewerParams) => {
  const { setOutfit } = params;
  const clock = useAnimationClock();
  const [view, setView] = useState<SheetView>('state');
  const [action, setAction] = useState(0x00);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  useEffect(() => {
    if (action === BUNNY_ACTION) setOutfit('bunny');
  }, [action, setOutfit]);

  return { clock, view, setView, action, setAction, scale, setScale };
};

export { useSpriteViewer };
