/* @layer renderer-components @kind component */
/**
 * One option line: label (and hint under it) on the left, the control on the
 * right. Every row in a widget's options panel, built-in or the widget's own,
 * is one of these.
 */
import { Box } from '../../../../../primitives/Box';
import { Text } from '../../../../../primitives/Text';
import type { OptionRowProps } from '../WidgetOptions.type';

const OptionRow = (props: OptionRowProps) => {
  const { label, hint, children } = props;
  return (
    <Box className="widget-option-row">
      <Box className="widget-option-row__text">
        <Text className="widget-option-row__label">{label}</Text>
        {hint && <Text className="widget-option-row__hint">{hint}</Text>}
      </Box>
      <Box className="widget-option-row__control">{children}</Box>
    </Box>
  );
};

export { OptionRow };
