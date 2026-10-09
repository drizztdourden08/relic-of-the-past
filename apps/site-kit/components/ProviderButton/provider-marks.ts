/* @layer site-kit @kind data */
import type { IconifyIcon } from '@iconify/react/offline';
import discordMark from '@iconify-icons/simple-icons/discord';
import githubMark from '@iconify-icons/simple-icons/github';
import googleMark from '@iconify-icons/logos/google-icon';
import type { Provider } from '@shared/hub/providers';

const PROVIDER_MARKS: Record<Provider, IconifyIcon> = {
  discord: discordMark,
  github: githubMark,
  google: googleMark,
};

export { PROVIDER_MARKS };
