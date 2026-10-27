/* @layer website-site @kind component */
import type { PressableProps } from './Pressable.type';

const Pressable = ({ type = 'button', children, ...rest }: PressableProps) => (
  <button type={type} {...rest}>
    {children}
  </button>
);

export { Pressable };
