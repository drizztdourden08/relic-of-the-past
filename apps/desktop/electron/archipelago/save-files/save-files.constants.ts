/* @layer electron-main @kind constants */
import type { OpenDialogOptions } from 'electron';

const UNSAFE_FILENAME_CHARACTERS = '<>:"/\\|?*';

const FIRST_PRINTABLE_CODE = 32;

const FALLBACK_SLOT_NAME = 'Player';

const CANCELLED_REASON = 'cancelled';

const FOLDER_DIALOG: OpenDialogOptions = {
  title: 'Save Archipelago files',
  properties: ['openDirectory', 'createDirectory'],
};

export { CANCELLED_REASON, FALLBACK_SLOT_NAME, FIRST_PRINTABLE_CODE, FOLDER_DIALOG, UNSAFE_FILENAME_CHARACTERS };
