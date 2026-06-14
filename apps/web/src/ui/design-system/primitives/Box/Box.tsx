/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import type { BoxProps } from './Box.type';

/** Generic structural element — the design-system's plain `<div>` replacement. */
const Box = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const { as: Tag = 'div', children, ...rest } = props;
  return <Tag ref={ref} {...rest}>{children}</Tag>;
});

export { Box };
