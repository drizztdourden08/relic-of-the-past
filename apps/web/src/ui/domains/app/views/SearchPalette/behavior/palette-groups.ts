/* @layer renderer-components @kind logic */
import type { CommandPaletteGroup } from '@drizztdourden08/tessera/composites';
import { IDLE_SCREEN_LIMIT } from '../SearchPalette.constants';
import type { SearchEntry, SearchPaletteItem } from '../SearchPalette.type';

const itemOf = (entry: SearchEntry, onToggle: (entry: SearchEntry) => void): SearchPaletteItem => ({
  id: entry.id,
  label: entry.label,
  icon: entry.icon,
  description: entry.description,
  breadcrumb: entry.breadcrumb,
  disabled: entry.disabled,
  checked: entry.checked,
  toggle: entry.settingKey ? { checked: entry.toggleValue === true, onChange: () => onToggle(entry) } : undefined,
  entry,
});

const paletteGroups = (
  catalog: readonly SearchEntry[],
  results: readonly SearchEntry[],
  query: string,
  onToggle: (entry: SearchEntry) => void,
): CommandPaletteGroup<SearchPaletteItem>[] => {
  if (query.trim().length === 0) {
    const screens = catalog.filter((e) => e.kind === 'screen').slice(0, IDLE_SCREEN_LIMIT);
    return [{ id: 'screens', label: 'Screens', items: screens.map((e) => itemOf(e, onToggle)) }];
  }
  return [{ id: 'results', items: results.map((e) => itemOf(e, onToggle)) }];
};

export { paletteGroups };
