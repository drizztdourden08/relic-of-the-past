/* @layer site-kit @kind constants */
/** The dialog's fixed words. */
const DIALOG_TEXT = {
  keepBrowsing: 'You can close this and keep browsing. The upload continues in the corner. Leaving the site pauses it; it continues when you come back.',
  keptCopy: 'Your browser keeps a temporary copy of this file while it uploads, so the upload can continue by itself if the page is reloaded, or closed and opened again. The copy is deleted as soon as the upload finishes.',
  needsFile: (name: string) => `The page was reloaded. Pick ${name} again in the uploads tray to continue.`,
} as const;

export { DIALOG_TEXT };
