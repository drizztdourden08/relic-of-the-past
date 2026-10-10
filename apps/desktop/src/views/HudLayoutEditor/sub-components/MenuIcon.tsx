/* @layer renderer-components @kind component */
import { Icon, Span } from '@drizztdourden08/tessera/primitives';
import type { MenuIconProps } from './MenuIcon.type';

const MenuIcon = (props: MenuIconProps) => {
  const { source } = props;
  return typeof source === 'string' ? <Span aria-hidden>{source}</Span> : <Icon icon={source} size={16} aria-hidden />;
};

export { MenuIcon };
