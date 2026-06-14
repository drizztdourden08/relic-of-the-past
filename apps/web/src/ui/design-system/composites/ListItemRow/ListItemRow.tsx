/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import './ListItemRow.css';
import type { ListItemRowProps } from './ListItemRow.type';

const ListItemRow = (props: ListItemRowProps) => {
  const { name, icon, meta, action, selected, onClick, onDoubleClick, className = '' } = props;
  return (
    <Box
      className={`list-item-row${selected ? ' list-item-row--selected' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {icon != null && <Text className="list-item-row__icon">{icon}</Text>}
      <Box className="list-item-row__info">
        <Box className="list-item-row__name">{name}</Box>
        {meta != null && <Box className="list-item-row__meta">{meta}</Box>}
      </Box>
      {action != null && <Box className="list-item-row__action">{action}</Box>}
    </Box>
  );
};

export { ListItemRow };
