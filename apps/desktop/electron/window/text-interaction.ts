/* @layer electron-main @kind logic */
/**
 * Native text interaction for the main window: a right-click context menu
 * (Copy / Paste / Select All, shown only where they make sense) and a
 * main-process Ctrl/Cmd+C handler. The renderer hosts a live game whose input
 * layer sits on the same key events — handling the copy chord at the
 * before-input-event stage guarantees a selection always copies regardless of
 * what page-level handlers do with the keystroke.
 */
import { Menu } from 'electron';
import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';

const attachTextInteraction = (win: BrowserWindow): void => {
  win.webContents.on('context-menu', (_event, params) => {
    const hasSelection = params.selectionText.trim().length > 0;
    const template: MenuItemConstructorOptions[] = [];
    if (hasSelection) template.push({ role: 'copy' });
    if (params.isEditable) {
      if (params.selectionText.length > 0) template.push({ role: 'cut' });
      template.push({ role: 'paste' });
    }
    if (hasSelection || params.isEditable) template.push({ type: 'separator' }, { role: 'selectAll' });
    if (template.length === 0) return;
    Menu.buildFromTemplate(template).popup({ window: win });
  });

  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type !== 'keyDown' || !(input.control || input.meta)) return;
    if (input.key.toLowerCase() === 'c') win.webContents.copy();
  });
};

export { attachTextInteraction };
