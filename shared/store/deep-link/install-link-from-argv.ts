/* @layer shared-store @kind logic */
import type { InstallLink } from './deep-link.type';
import { parseInstallLink } from './parse-install-link';

const installLinkFromArgv = (argv: readonly string[]): InstallLink | null => {
  for (const arg of argv) {
    const link = parseInstallLink(arg);
    if (link) return link;
  }
  return null;
};

export { installLinkFromArgv };
