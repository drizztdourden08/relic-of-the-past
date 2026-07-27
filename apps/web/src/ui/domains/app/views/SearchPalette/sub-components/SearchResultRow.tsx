/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Toggle } from '@ds/primitives/Toggle';
import type { SearchEntry } from '../SearchPalette.type';

interface SearchResultRowProps {
  entry: SearchEntry;
  active: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onHover: () => void;
}

const SearchResultRow = (props: SearchResultRowProps) => {
  const { entry, active, onSelect, onToggle, onHover } = props;
  const rowClass = [
    'search-row',
    active && 'search-row--active',
    entry.disabled && 'search-row--disabled',
  ].filter(Boolean).join(' ');

  return (
    <Box
      className={rowClass}
      role="option"
      aria-selected={active}
      aria-disabled={entry.disabled}
      onMouseEnter={onHover}
      onClick={() => { if (!entry.disabled) onSelect(); }}
    >
      {entry.icon && <Text as="span" className="search-row__icon">{entry.icon}</Text>}

      <Box className="search-row__text">
        <Text className="search-row__label">{entry.label}</Text>
        {entry.description && <Text className="search-row__description">{entry.description}</Text>}
      </Box>

      <Text className="search-row__breadcrumb">{entry.breadcrumb.join(' › ')}</Text>

      {entry.checked !== undefined && (
        <Text as="span" className={`search-row__check${entry.checked ? ' is-on' : ''}`} aria-hidden />
      )}

      {entry.settingKey && (
        <Box className="search-row__toggle" onClick={(e) => e.stopPropagation()}>
          <Toggle checked={!!entry.toggleValue} onChange={onToggle} />
        </Box>
      )}
    </Box>
  );
};

export { SearchResultRow };
