/* @layer site-kit @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { RoleNameProps } from './RoleName.type';
import './RoleName.css';

const hexOf = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

const roleColorStyle = (color: number) =>
  (color ? { '--role-color': hexOf(color) } : undefined) as CSSProperties | undefined;

const RoleName = (props: RoleNameProps) => {
  const { name, color } = props;
  return (
    <Box as="span" className="role-name" style={roleColorStyle(color)}>
      <Box as="span" className="role-name__dot" aria-hidden="true" />
      <Text as="span" className="role-name__label">{name}</Text>
    </Box>
  );
};

export { RoleName };
