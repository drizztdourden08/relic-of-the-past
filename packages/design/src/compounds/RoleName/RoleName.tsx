/* @layer site-kit @kind component */
import { Tag } from '@drizztdourden08/tessera/primitives';
import type { TagCustomColor } from '@drizztdourden08/tessera/primitives';
import type { RoleNameProps } from './RoleName.type';

const hexOf = (color: number): TagCustomColor => `#${color.toString(16).padStart(6, '0')}`;

const RoleName = (props: RoleNameProps) => {
  const { name, color } = props;
  return color ? <Tag variant="custom" color={hexOf(color)}>{name}</Tag> : <Tag>{name}</Tag>;
};

export { RoleName };
