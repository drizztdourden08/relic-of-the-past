/* @layer sanctuary-site @kind component */
/**
 * The View picker of a FilterBar row: the user's named views, "Save current as", and,
 * once a view is active, update, rename and delete. Names are asked in a dialog; the
 * delete asks once.
 */
import { useMemo, useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import type { MenuEntry } from '@ds/composites/DropdownMenu';
import { useAnchorMenu } from '@ds/composites/FilterBar/behavior/use-anchor-menu';
import { NameDialog } from './NameDialog';
import type { SavedViewsState } from './useSavedViews';
import './SavedViewsMenu.css';

type SavedViewsMenuProps = {
  state: SavedViewsState;
};

type Prompt = 'save' | 'rename' | 'delete' | null;

/** The portalled menu, so a click inside it does not count as an outside click. */
const MENU_SELECTOR = '.dropdown-menu';

const SavedViewsMenu = (props: SavedViewsMenuProps) => {
  const { state } = props;
  const { views, active, busy, error } = state;
  const menu = useAnchorMenu<HTMLButtonElement>(MENU_SELECTOR);
  const [prompt, setPrompt] = useState<Prompt>(null);

  const items = useMemo<MenuEntry[]>(() => {
    const pick = (action: () => void) => () => { menu.close(); action(); };
    const list: MenuEntry[] = views.map((view) => ({
      key: view.id,
      label: view.name,
      checked: view.id === active?.id,
      onClick: pick(() => void state.apply(view.id)),
    }));
    if (list.length) list.push('separator');
    list.push({ key: 'save', label: 'Save current as...', onClick: pick(() => setPrompt('save')) });
    if (active) {
      list.push(
        { key: 'update', label: `Update "${active.name}"`, onClick: pick(() => void state.update(active.id)) },
        { key: 'rename', label: 'Rename...', onClick: pick(() => setPrompt('rename')) },
        { key: 'delete', label: 'Delete', onClick: pick(() => setPrompt('delete')) },
      );
    }
    return list;
  }, [views, active, state, menu]);

  return (
    <>
      <Button ref={menu.anchorRef} variant="secondary" size="sm" className="saved-views__trigger" disabled={busy} onClick={menu.toggle}>
        <Text as="span" className="saved-views__eyebrow">View</Text>
        <Text as="span" className="saved-views__name">{active ? active.name : 'Current'}</Text>
        <Text as="span" aria-hidden="true">{'▾'}</Text>
      </Button>
      {error && <Text as="span" variant="caption" role="alert">{error}</Text>}
      {menu.open && <DropdownMenu items={items} anchorRef={menu.anchorRef} align="end" />}
      <NameDialog
        open={prompt === 'save'}
        title="Save view"
        confirmLabel="Save"
        onConfirm={(name) => { setPrompt(null); void state.saveAs(name); }}
        onCancel={() => setPrompt(null)}
      />
      <NameDialog
        open={prompt === 'rename'}
        title="Rename view"
        confirmLabel="Rename"
        initialValue={active?.name}
        onConfirm={(name) => { setPrompt(null); if (active) void state.rename(active.id, name); }}
        onCancel={() => setPrompt(null)}
      />
      <Dialog
        open={prompt === 'delete'}
        title="Delete view"
        message={active ? `Delete the view "${active.name}"? The current arrangement stays as it is.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setPrompt(null); if (active) void state.remove(active.id); }}
        onCancel={() => setPrompt(null)}
      />
    </>
  );
};

export { SavedViewsMenu };
export type { SavedViewsMenuProps };
