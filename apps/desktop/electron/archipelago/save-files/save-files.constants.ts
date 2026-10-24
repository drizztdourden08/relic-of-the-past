/* @layer electron-main @kind constants */
import type { OpenDialogOptions } from 'electron';

/** Characters Windows refuses in a file name, plus control characters. */
const UNSAFE_FILENAME = /[<>:"/\|?*\u0000-\u001f]/g;

/** The slot a profile with no name of its own connects as, so the file names the same slot. */
const FALLBACK_SLOT_NAME = 'Player';

const CANCELLED_REASON = 'cancelled';

const FOLDER_DIALOG: OpenDialogOptions = {
  title: 'Save Archipelago files',
  properties: ['openDirectory', 'createDirectory'],
};

export { CANCELLED_REASON, FALLBACK_SLOT_NAME, FOLDER_DIALOG, UNSAFE_FILENAME };
