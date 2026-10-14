/* @layer renderer-hud @kind component */
import { forwardRef } from 'react';
import type { HudBoxProps } from './HudBox.type';
import './HudBox.css';

const HudBox = forwardRef<HTMLElement, HudBoxProps>((props, ref) => {
  const { as: Tag = 'div', layout, className, children, ...rest } = props;
  const classes = [className, layout && `hud-box--${layout}`].filter(Boolean).join(' ');
  return <Tag ref={ref} className={classes || undefined} {...rest}>{children}</Tag>;
});

export { HudBox };
