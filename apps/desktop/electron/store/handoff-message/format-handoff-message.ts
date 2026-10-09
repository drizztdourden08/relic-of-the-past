/* @layer electron-main @kind logic */
import { formatInstallLink } from '@shared/store/deep-link';
import type { InstallLink } from '@shared/store/deep-link';

const formatHandoffMessage = (link: InstallLink): string => `${formatInstallLink(link)}\n`;

export { formatHandoffMessage };
