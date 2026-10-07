/* @layer renderer-hud @kind component */
import { forwardRef } from 'react';
import type { HudBoxProps } from './HudBox.type';

/**
 * Generic structural element for the HUD domain, standing in for `<div>`.
 * HUD replicates the in-game interface and therefore keeps its own
 * primitive set instead of using the design-system primitives; this is its Box.
 */
const HudBox = forwardRef<HTMLElement, HudBoxProps>((props, ref) => {
  const { as: Tag = 'div', children, ...rest } = props;
  return <Tag ref={ref} {...rest}>{children}</Tag>;
});

export { HudBox };
