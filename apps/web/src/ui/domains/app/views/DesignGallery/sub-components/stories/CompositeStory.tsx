/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Box, Text, Button } from '../../../../../../design-system/primitives';
import { Dialog } from '../../../../../../design-system/composites/Dialog';
import { ListItemRow } from '../../../../../../design-system/composites/ListItemRow';
import { SideNav } from '../../../../../../design-system/composites/SideNav';
import { Specimen } from '../Specimen';

const NAV_GROUPS = [
  { title: 'Settings', items: [{ id: 'audio', label: 'Audio' }, { id: 'graphics', label: 'Graphics' }, { id: 'controls', label: 'Controls' }] },
];
const ROWS = [
  { id: 'lw', name: 'Light World' },
  { id: 'dw', name: 'Dark World' },
  { id: 'cave', name: 'Mysterious Cave' },
];
const SHELLS = [
  'SettingsShell: the shell you are viewing now (SideNav + scrollable panel).',
  'MasterDetailLayout: two-column list / detail.',
  'WizardDialogShell: multi-step modal (Screen & Connection editors).',
  'DropdownMenu: anchored popup menu (the title-bar menu).',
  'Widget: draggable floating widget frame.',
  'Toast: transient notifications (bottom corner).',
];

/** Components: composites (live where inline-able, documented for shells/overlays). */
const CompositeStory = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [navId, setNavId] = useState('audio');
  const [sel, setSel] = useState('dw');

  return (
    <Box className="dg-stack">
      <Specimen label="Dialog" hint="confirm / cancel modal (built on DialogShell)">
        <Button variant="tertiary" onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Dialog
          open={dialogOpen}
          title="Delete profile?"
          message="This cannot be undone."
          variant="danger"
          confirmLabel="Delete"
          onConfirm={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        />
      </Specimen>

      <Specimen label="ListItemRow" hint="icon · name · meta · hover action; selected = gold">
        <Box>
          {ROWS.map(r => (
            <ListItemRow
              key={r.id}
              name={r.name}
              icon="🗺️"
              meta="12 checks"
              selected={sel === r.id}
              onClick={() => setSel(r.id)}
              action={<Button variant="ghost" size="sm">Edit</Button>}
            />
          ))}
        </Box>
      </Specimen>

      <Specimen label="SideNav" hint="searchable, grouped, gold-active">
        <Box className="dg-shell-demo">
          <SideNav groups={NAV_GROUPS} activeId={navId} onSelect={setNavId} searchable />
        </Box>
      </Specimen>

      <Specimen label="Shell & overlay composites" hint="full-page / portal, shown live in the app instead of inline">
        <Box className="dg-stack-sm">
          {SHELLS.map(s => <Text key={s} className="dg-doc">{s}</Text>)}
        </Box>
      </Specimen>
    </Box>
  );
};

export { CompositeStory };
