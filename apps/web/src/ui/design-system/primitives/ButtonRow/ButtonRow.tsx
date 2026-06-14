/* @layer renderer-components @kind component */
import { Flex } from '../Flex';
import type { ButtonRowProps } from './ButtonRow.type';

/** Footer/toolbar row of buttons — a Flex preset (justify=end, gap=sm, wraps). */
const ButtonRow = (props: ButtonRowProps) => {
  const { align = 'end', gap = 'sm', className, children } = props;
  return (
    <Flex justify={align} gap={gap} align="center" wrap className={className}>
      {children}
    </Flex>
  );
};

export { ButtonRow };
