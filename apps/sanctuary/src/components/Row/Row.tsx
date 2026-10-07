/* @layer sanctuary-site @kind component */
/**
 * One settings-style row: a fixed-width key, a dim value that takes the rest of the
 * line, and an action slot on the right. IdentityRow and DeviceRow are both this shape.
 */
import type { ReactNode } from 'react';
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import './Row.css';

type RowProps = {
  label: ReactNode;
  value: ReactNode;
  action?: ReactNode;
  className?: string;
};

const Row = (props: RowProps) => {
  const { label, value, action, className = '' } = props;
  return (
    <Flex align="center" gap="md" className={`row${className ? ` ${className}` : ''}`}>
      <Box as="span" className="row__key">{label}</Box>
      <Box as="span" className="row__value">{value}</Box>
      {action && <Box as="span" className="row__action">{action}</Box>}
    </Flex>
  );
};

export { Row };
export type { RowProps };
