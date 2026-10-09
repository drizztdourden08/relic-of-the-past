/* @layer renderer-hud @kind component */
import { forwardRef } from 'react';
import type { HudBoxProps } from './HudBox.type';

const HudBox = forwardRef<HTMLElement, HudBoxProps>((props, ref) => {
  const { as: Tag = 'div', children, ...rest } = props;
  return <Tag ref={ref} {...rest}>{children}</Tag>;
});

export { HudBox };
