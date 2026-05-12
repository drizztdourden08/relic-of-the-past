import { useState, useRef, useCallback, useEffect, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Portal } from '../Portal';
import './Select.css';

// ─── Legacy native select (backward compat) ───
interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}
export function NativeSelect({ className = '', children, ...props }: NativeSelectProps): JSX.Element {
  return (
    <select className={`select ${className}`} {...props}>
      {children}
    </select>
  );
}

// ─── Custom portal-based Select ───
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: 'md' | 'sm';
  className?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
}

export function Select({
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
}: SelectProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Flatten all options for keyboard nav
  const allOptions: SelectOption[] = groups
    ? groups.flatMap((g) => g.options)
    : options ?? [];

  const filtered = search
    ? allOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : allOptions;

  const selectedOption = allOptions.find((o) => o.value === value);

  // Position the dropdown
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 200 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 200 && rect.top > spaceBelow;
    setPos({
      top: dropUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    // If dropping up, we need to transform the content
    if (contentRef.current) {
      contentRef.current.style.transform = dropUp ? 'translateY(-100%)' : '';
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setHighlightIdx(-1);
    // Position is calculated after render via useEffect
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      handleClose();
    },
    [onChange, handleClose],
  );

  // Update position when opening
  useEffect(() => {
    if (open) {
      updatePosition();
      // Focus search input if searchable
      requestAnimationFrame(() => {
        if (searchable && searchRef.current) {
          searchRef.current.focus();
        }
      });
    }
  }, [open, updatePosition, searchable]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        contentRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, handleClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open, handleClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIdx((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < filtered.length) {
            handleSelect(filtered[highlightIdx].value);
          }
          break;
      }
    },
    [open, highlightIdx, filtered, handleOpen, handleSelect],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || highlightIdx < 0) return;
    const el = contentRef.current?.querySelector(`[data-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  const triggerCls = [
    'select-trigger',
    open && 'select-trigger--open',
    disabled && 'select-trigger--disabled',
    size === 'sm' && 'select-trigger--sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerCls}
        onClick={() => (open ? handleClose() : handleOpen())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`select-trigger__text ${!selectedOption ? 'select-trigger__placeholder' : ''}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="select-trigger__chevron">▼</span>
      </button>

      {open && (
        <Portal layer="overlay">
          <div
            ref={contentRef}
            className="select-content"
            style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 180) }}
            role="listbox"
            onKeyDown={handleKeyDown}
          >
            {searchable && (
              <div className="select-search">
                <input
                  ref={searchRef}
                  className="select-search__input"
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setHighlightIdx(0); }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {search ? (
              // Flat filtered list
              filtered.length === 0 ? (
                <div className="select-empty">No matches</div>
              ) : (
                filtered.map((opt, idx) => (
                  <SelectItem
                    key={opt.value}
                    option={opt}
                    selected={opt.value === value}
                    highlighted={idx === highlightIdx}
                    idx={idx}
                    onSelect={handleSelect}
                    renderOption={renderOption}
                  />
                ))
              )
            ) : groups ? (
              // Grouped display
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
                        highlighted={flatIdx === highlightIdx}
                        idx={flatIdx}
                        onSelect={handleSelect}
                        renderOption={renderOption}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              // Flat list
              allOptions.map((opt, idx) => (
                <SelectItem
                  key={opt.value}
                  option={opt}
                  selected={opt.value === value}
                  highlighted={idx === highlightIdx}
                  idx={idx}
                  onSelect={handleSelect}
                  renderOption={renderOption}
                />
              ))
            )}
          </div>
        </Portal>
      )}
    </>
  );
}

// ─── Individual item ───
function SelectItem({
  option,
  selected,
  highlighted,
  idx,
  onSelect,
  renderOption,
}: {
  option: SelectOption;
  selected: boolean;
  highlighted: boolean;
  idx: number;
  onSelect: (val: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
}): JSX.Element {
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
}
