/* @layer sanctuary-site @kind component */
/**
 * A Discord role as Discord shows it: a dot in the role's colour, then its name. A role
 * with no colour draws the dot in the dim text colour, as Discord does.
 */
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import './RoleName.css';

type RoleNameProps = {
  name: string;
  /** RGB as a number; 0 means no colour. */
  color: number;
};

const hexOf = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

const RoleName = (props: RoleNameProps) => {
  const { name, color } = props;
  // The colour is the role's own data, so it arrives as a custom property, not a token.
  const style = (color ? { '--role-color': hexOf(color) } : undefined) as CSSProperties | undefined;
  return (
    <Box as="span" className="role-name" style={style}>
      <Box as="span" className="role-name__dot" aria-hidden="true" />
      <Text as="span" className="role-name__label">{name}</Text>
    </Box>
  );
};

export { RoleName };
export type { RoleNameProps };
