/* @layer renderer-components @kind component */
/**
 * One line of a widget's own options inside its settings popover: the label
 * (and a hint under it) on the left, the control on the right.
 */
import type { ReactNode } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';

interface OptionRowProps {
  /** What the control sets. */
  label: string;
  /** A short line under the label saying what the option does. */
  hint?: string;
  /** The control. */
  children: ReactNode;
}

const OptionRow = (props: OptionRowProps) => {
  const { label, hint, children } = props;
  return (
    <Box className="widget-settings__row">
      <Box className="widget-settings__text">
        <Text className="widget-settings__label">{label}</Text>
        {hint && <Text className="widget-settings__hint">{hint}</Text>}
      </Box>
      {children}
    </Box>
  );
};

export { OptionRow };
export type { OptionRowProps };
