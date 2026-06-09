/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { IconButton } from '../../primitives/IconButton';
import './WindowHeader.css';
import { type WindowHeaderProps } from './WindowHeader.type';

/** Shared window/dialog title bar: gold uppercase title on the left, ✕ inline on the right. */
const WindowHeader = (props: WindowHeaderProps) => {
  const { title, onClose, extra, className = '' } = props;
  return (
    <Box className={`window-header${className ? ` ${className}` : ''}`}>
      <Text as="h3" className="window-header__title">{title}</Text>
      {extra && <Box className="window-header__extra">{extra}</Box>}
      {onClose && (
        <IconButton variant="ghost" size="md" label="Close" className="window-header__close" onClick={onClose}>✕</IconButton>
      )}
    </Box>
  );
};

export { WindowHeader };
