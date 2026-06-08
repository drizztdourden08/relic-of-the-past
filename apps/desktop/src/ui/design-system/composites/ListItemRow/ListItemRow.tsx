/* @layer renderer-components @kind component */
import './ListItemRow.css';
import type { ListItemRowProps } from './ListItemRow.type';

const ListItemRow = (props: ListItemRowProps) => {
  const { name, icon, meta, action, selected, onClick, onDoubleClick, className = '' } = props;
  return (
    <div
      className={`list-item-row${selected ? ' list-item-row--selected' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {icon != null && <span className="list-item-row__icon">{icon}</span>}
      <div className="list-item-row__info">
        <div className="list-item-row__name">{name}</div>
        {meta != null && <div className="list-item-row__meta">{meta}</div>}
      </div>
      {action != null && <div className="list-item-row__action">{action}</div>}
    </div>
  );
};

export { ListItemRow };
