/* @layer site-kit @kind logic */
import type { MenuGroup, MenuItem } from '@drizztdourden08/tessera/composites';
import type { Prompt } from '../compounds/SavedViewsMenu/SavedViewsMenu.type';
import type { SavedViewsState } from '../hooks/useSavedViews/useSavedViews.type';

const savedViewGroups = (state: SavedViewsState, ask: (prompt: Prompt) => void): MenuGroup[] => {
  const { views, active } = state;
  const saved: MenuItem[] = views.map((view) => ({
    id: view.id,
    label: view.name,
    kind: 'radio',
    checked: view.id === active?.id,
    onSelect: () => void state.apply(view.id),
  }));
  const manage: MenuItem[] = [{ id: 'save', label: 'Save current as...', onSelect: () => ask('save') }];
  if (active) {
    manage.push(
      { id: 'update', label: `Update "${active.name}"`, onSelect: () => void state.update(active.id) },
      { id: 'rename', label: 'Rename...', onSelect: () => ask('rename') },
      { id: 'delete', label: 'Delete', tone: 'danger', onSelect: () => ask('delete') },
    );
  }
  return saved.length ? [{ id: 'views', items: saved }, { id: 'manage', items: manage }] : [{ id: 'manage', items: manage }];
};

export { savedViewGroups };
