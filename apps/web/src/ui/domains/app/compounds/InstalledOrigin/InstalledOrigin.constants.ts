/* @layer renderer-components @kind constants */

const READ_ONLY_NOTE = 'Read only: it stays as its author published it. Duplicate it to make your own version.';

const uninstallTitle = (name: string): string => `Uninstall ${name}`;

const uninstallMessage = (name: string): string =>
  `Remove ${name} from this computer? A profile that uses it goes back to the default.`;

export { READ_ONLY_NOTE, uninstallTitle, uninstallMessage };
