/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import type { HudLayout, MeasureContext, Size } from '@rotp/hud';
import type { PlacedLayout } from '../HudLayoutView.type';
import { placeLayout } from './place-layout';

const usePlacedLayout = (doc: HudLayout, view: Size, ctx: MeasureContext): PlacedLayout =>
  useMemo(() => placeLayout(doc, view, ctx), [doc, view, ctx]);

export { usePlacedLayout };
