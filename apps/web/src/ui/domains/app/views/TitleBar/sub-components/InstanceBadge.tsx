/* @layer renderer-components @kind component */
import { Text } from '../../../../../design-system/primitives/Text';
import type { InstanceBadgeProps } from '../TitleBar.type';

const InstanceBadge = ({ name }: InstanceBadgeProps) => {
  return <Text className="titlebar__instance">{name}</Text>;
};

export { InstanceBadge };
