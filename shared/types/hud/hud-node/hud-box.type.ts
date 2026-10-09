/* @layer shared-types @kind types */
import type { HudAnimation, HudTransition } from '../hud-motion';
import type { HudBoxStyle } from '../hud-style';
import type { Value } from '../hud-value';

type Extent = { px: Value } | { pct: Value } | { from: 'data'; expr: string } | 'auto' | 'fill';

interface Edges { top?: number; right?: number; bottom?: number; left?: number }

interface HudPlace { column?: number; row?: number; colSpan?: number; rowSpan?: number }

type HudAlignSelf = 'start' | 'center' | 'end' | 'stretch';

interface HudBox {
  id: string;
  size?: { w?: Extent; h?: Extent };
  min?: { w?: Value; h?: Value };
  max?: { w?: Value; h?: Value };
  margin?: Edges;
  padding?: Edges;
  scale?: Value;
  opacity?: Value;
  visible?: boolean | Value;
  dimWhenEmpty?: number[];
  place?: HudPlace;
  order?: number;
  alignSelf?: HudAlignSelf;
  justifySelf?: HudAlignSelf;
  style?: HudBoxStyle;
  animation?: HudAnimation[];
  transition?: HudTransition;
}

export type { Edges, Extent, HudAlignSelf, HudBox, HudPlace };
