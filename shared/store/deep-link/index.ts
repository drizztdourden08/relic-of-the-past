/* @layer shared-store @kind barrel */
export { INSTALL_SCHEME } from './deep-link.constants';
export { parseInstallLink } from './parse-install-link';
export { formatInstallLink } from './format-install-link';
export { installLinkFromArgv } from './install-link-from-argv';
export { isStoreDocId } from './is-store-doc-id';
export type { InstallLink } from './deep-link.type';
