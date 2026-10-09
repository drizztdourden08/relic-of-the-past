/* @layer shared-types @kind types */
import type { Value } from '../hud-value';
import type { Extent, HudBox } from './hud-box.type';
import type { HudNode } from './hud-node.type';

interface HudGap { x?: Value; y?: Value }

interface HudGuide { show: boolean; color: string }

interface HudContainerBase extends HudBox {
  kind: 'container';
  gap?: HudGap;
  guide?: HudGuide;
  children: HudNode[];
}

interface HudFlexBase extends HudContainerBase {
  direction: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

interface HudFlexContainer extends HudFlexBase {
  layout?: 'flex';
}

type HudGridJustifyItems = 'start' | 'center' | 'end' | 'stretch';

interface HudGridContainer extends HudContainerBase {
  layout: 'grid';
  columns: Extent[];
  rows?: Extent[];
  justifyItems?: HudGridJustifyItems;
  alignItems?: HudGridJustifyItems;
}

type HudContainer = HudFlexContainer | HudGridContainer;

export type {
  HudContainer, HudContainerBase, HudFlexContainer, HudGap, HudGridContainer, HudGridJustifyItems, HudGuide,
};
