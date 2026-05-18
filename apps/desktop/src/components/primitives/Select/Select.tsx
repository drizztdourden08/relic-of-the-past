import { Portal } from '../Portal';
import { useSelectDropdown } from './behavior/useSelectDropdown';
import { SelectItem } from './sub-components/SelectItem';
import type { SelectProps, SelectOption } from './types';
import './Select.css';

export const Select = (props: SelectProps) => {
  const {
    value,
    onChange,
    options,
    groups,
    placeholder = 'Select…',
    disabled = false,
    searchable = false,
    size = 'md',
    className = '',
    renderOption,
  } = props;

  const allOptions: SelectOption[] = groups
    ? groups.flatMap((g) => g.options)
    : options ?? [];

  const selectedOption = allOptions.find((o) => o.value === value);

  const dropdown = useSelectDropdown({ disabled, searchable, allOptions, onChange });

  const triggerCls = [
    'select-trigger',
    dropdown.open && 'select-trigger--open',
    disabled && 'select-trigger--disabled',
    size === 'sm' && 'select-trigger--sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      <button
        ref={dropdown.triggerRef}
        type="button"
        className={triggerCls}
        onClick={() => (dropdown.open ? dropdown.handleClose() : dropdown.handleOpen())}
        onKeyDown={dropdown.handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={dropdown.open}
      >
        <span className={`select-trigger__text ${!selectedOption ? 'select-trigger__placeholder' : ''}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="select-trigger__chevron">▼</span>
      </button>

      {dropdown.open && (
        <Portal layer="overlay">
          <div
            ref={dropdown.contentRef}
            className="select-content"
            style={{ top: dropdown.pos.top, left: dropdown.pos.left, width: Math.max(dropdown.pos.width, 180) }}
            role="listbox"
            onKeyDown={dropdown.handleKeyDown}
          >
            {searchable && (
              <div className="select-search">
                <input
                  ref={dropdown.searchRef}
                  className="select-search__input"
                  type="text"
                  placeholder="Search…"
                  value={dropdown.search}
                  onChange={(e) => { dropdown.setSearch(e.target.value); dropdown.setHighlightIdx(0); }}
                  onKeyDown={dropdown.handleKeyDown}
                />
              </div>
            )}

            {dropdown.search ? (
              dropdown.filtered.length === 0 ? (
                <div className="select-empty">No matches</div>
              ) : (
                dropdown.filtered.map((opt, idx) => (
                  <SelectItem
                    key={opt.value}
                    option={opt}
                    selected={opt.value === value}
                    highlighted={idx === dropdown.highlightIdx}
                    idx={idx}
                    onSelect={dropdown.handleSelect}
                    renderOption={renderOption}
                  />
                ))
              )
            ) : groups ? (
              groups.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <div className="select-separator" />}
                  <div className="select-group-label">{group.label}</div>
                  {group.options.map((opt) => {
                    const flatIdx = allOptions.indexOf(opt);
                    return (
                      <SelectItem
                        key={opt.value}
                        option={opt}
                        selected={opt.value === value}
                        highlighted={flatIdx === dropdown.highlightIdx}
                        idx={flatIdx}
                        onSelect={dropdown.handleSelect}
                        renderOption={renderOption}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              allOptions.map((opt, idx) => (
                <SelectItem
                  key={opt.value}
                  option={opt}
                  selected={opt.value === value}
                  highlighted={idx === dropdown.highlightIdx}
                  idx={idx}
                  onSelect={dropdown.handleSelect}
                  renderOption={renderOption}
                />
              ))
            )}
          </div>
        </Portal>
      )}
    </>
  );
};
