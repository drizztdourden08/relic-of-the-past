/* @layer site-kit @kind component */
import { useMemo, useState } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { Dialog, DropdownMenu } from '@drizztdourden08/tessera/composites';
import { NameDialog } from '../NameDialog/NameDialog';
import { savedViewGroups } from '../../saved-views/saved-view-groups';
import type { Prompt, SavedViewsMenuProps } from './SavedViewsMenu.type';
import './SavedViewsMenu.css';

const SavedViewsMenu = (props: SavedViewsMenuProps) => {
  const { state } = props;
  const { active, busy, error } = state;
  const [prompt, setPrompt] = useState<Prompt>(null);

  const groups = useMemo(() => savedViewGroups(state, setPrompt), [state]);

  return (
    <>
      <DropdownMenu
        trigger={{ label: `View: ${active ? active.name : 'Current'}`, icon: 'chevron-down', iconSide: 'end' }}
        variant="secondary"
        size="sm"
        align="end"
        disabled={busy}
        className="saved-views__menu"
        groups={groups}
      />
      {error && <Text as="span" variant="caption" role="alert">{error}</Text>}
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
export type { SavedViewsMenuProps } from './SavedViewsMenu.type';
