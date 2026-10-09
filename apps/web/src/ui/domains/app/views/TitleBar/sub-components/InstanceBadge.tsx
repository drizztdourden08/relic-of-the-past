/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { InstanceBadgeProps } from '../TitleBar.type';

const InstanceBadge = ({ name }: InstanceBadgeProps) => {
  return <Text className="titlebar__instance">{name}</Text>;
};

export { InstanceBadge };
