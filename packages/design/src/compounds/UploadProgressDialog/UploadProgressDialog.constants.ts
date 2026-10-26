/* @layer site-kit @kind constants */
const DIALOG_TEXT = {
  keepBrowsing: 'You can close this and keep browsing. The upload continues in the corner and pauses if you leave the site.',
  keptCopy: 'Your browser keeps a temporary copy of this file while it uploads, so the upload can resume after a reload. The copy is deleted when the upload finishes.',
  needsFile: (name: string) => `The page was reloaded. Pick ${name} again in the uploads tray to continue.`,
} as const;

export { DIALOG_TEXT };
