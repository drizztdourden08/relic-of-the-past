/* @layer tests @kind helper */
import type { HudContainer, HudFlexContainer, HudGridContainer, HudNode } from '@rotp/hud';
import { required } from '../required';

const containerOf = (node: HudNode | undefined, what: string): HudContainer => {
  const found = required(node, what);
  if (found.kind !== 'container') throw new Error(`test expected ${what} to be a container`);
  return found;
};

const flexOf = (node: HudNode | undefined, what: string): HudFlexContainer => {
  const found = containerOf(node, what);
  if (found.layout === 'grid') throw new Error(`test expected ${what} to be a flex container`);
  return found;
};

const gridOf = (node: HudNode | undefined, what: string): HudGridContainer => {
  const found = containerOf(node, what);
  if (found.layout !== 'grid') throw new Error(`test expected ${what} to be a grid container`);
  return found;
};

const childrenOf = (node: HudNode | undefined, what: string): HudNode[] =>
  containerOf(node, what).children;

export { childrenOf, containerOf, flexOf, gridOf };
