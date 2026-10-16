/* @layer renderer-components @kind constants */
import type { Hint } from '@drizztdourden08/tessera/primitives';

const IDLE_HINT = 'Save keeps the sprite in this app. Export writes a file to share or install elsewhere.';

const NEEDS_ROM = 'Needs a ROM with compiled assets, because the stock sheet is read from it.';

const HINTS = {
  create: { label: 'New sprite', description: 'Starts from the stock sheet.' },
  createLocked: { label: 'New sprite', description: NEEDS_ROM },
  close: { label: 'Close', description: 'Closes the editor. Palette changes that were not saved are lost.' },
  save: {
    label: 'Save',
    description: 'Keeps your changes in this app. A running game updates at once when the active profile uses this sprite.',
  },
  saveRsp: { label: 'Save as pack', description: 'Keeps a copy in this app as a .rsp pack.' },
  saveZspr: { label: 'Save as .zspr', description: 'Keeps a copy in this app as a .zspr sprite.' },
  revert: { label: 'Revert', description: 'Drops the palette changes made since the last save.' },
  exportRsp: { label: 'Export .rsp', description: 'Writes a .rsp file to share or install elsewhere. Your library does not change.' },
  exportZspr: { label: 'Export .zspr', description: 'Writes a .zspr file for other tools. Your library does not change.' },
} satisfies Record<string, Hint>;

const NOT_APPLIED_NOTE = 'The running game did not take it: a live apply needs the active profile to have this sprite selected, with Vanilla Safe off.';

const EMPTY_EDITOR = 'Select a sprite to open it, or create one from the stock sheet.';

export { EMPTY_EDITOR, HINTS, IDLE_HINT, NOT_APPLIED_NOTE };
