/* @layer renderer-components @kind component */
import type { SelectItemProps } from '../types';

const SelectItem = (props: SelectItemProps) => {
  const { option, selected, highlighted, idx, onSelect, renderOption } = props;

  const cls = [
    'select-item',
    selected && 'select-item--selected',
    highlighted && 'select-item--highlighted',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      data-idx={idx}
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(option.value)}
    >
      <span className="select-item__check">{selected ? '✓' : ''}</span>
      {renderOption ? (
        renderOption(option, selected)
      ) : (
        <>
          <span className="select-item__label">{option.label}</span>
          {option.description && <span className="select-item__description">{option.description}</span>}
        </>
      )}
    </div>
  );
};

export { SelectItem };
