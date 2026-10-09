/* @layer site-kit @kind component */
import { Flex, Box } from '@drizztdourden08/tessera/primitives';
import type { RowProps } from './Row.type';
import './Row.css';

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
export type { RowProps } from './Row.type';
