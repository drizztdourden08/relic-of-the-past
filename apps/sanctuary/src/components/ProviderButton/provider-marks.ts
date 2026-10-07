/* @layer sanctuary-site @kind data */
/**
 * Each provider's official mark. Discord and GitHub are single-colour marks drawn in
 * the button's text colour; Google's is its four-colour G, which its guidelines require.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import discordMark from '@iconify-icons/simple-icons/discord';
import githubMark from '@iconify-icons/simple-icons/github';
import googleMark from '@iconify-icons/logos/google-icon';
import type { Provider } from '@shared/sanctuary/providers';

const PROVIDER_MARKS: Record<Provider, IconifyIcon> = {
  discord: discordMark,
  github: githubMark,
  google: googleMark,
};

export { PROVIDER_MARKS };
