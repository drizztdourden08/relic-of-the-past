/* @layer website-site @kind component */
import type { BoxProps } from './Box.type';

const Box = ({ as: Tag = 'div', children, ...rest }: BoxProps) => <Tag {...rest}>{children}</Tag>;

export { Box };
