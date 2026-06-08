/* @layer renderer-components @kind component */
import type { BoxProps } from './Box.type';

/** Generic structural element — the design-system's plain `<div>` replacement. */
const Box = (props: BoxProps) => {
  const { as: Tag = 'div', children, ...rest } = props;
  return <Tag {...rest}>{children}</Tag>;
};

export { Box };
