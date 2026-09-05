/* @layer renderer-components @kind component */
/**
 * Marks the window as a named instance, an automated launch running beside the
 * user's own app. Presentational: the name is supplied by the view.
 *
 * The name is the identifier, so it is shown verbatim, not abbreviated.
 */
import { Text } from '../../../../../design-system/primitives/Text';

interface InstanceBadgeProps {
  name: string;
}

const InstanceBadge = ({ name }: InstanceBadgeProps) => {
  return <Text className="titlebar__instance">{name}</Text>;
};

export { InstanceBadge };
export type { InstanceBadgeProps };
