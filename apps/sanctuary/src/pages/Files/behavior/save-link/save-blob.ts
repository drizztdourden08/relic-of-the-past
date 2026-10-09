/* @layer sanctuary-site @kind logic */
import { clickLink } from './click-link';
import { REVOKE_AFTER_MS } from './save-link.constants';

const saveBlob = (blob: Blob, name: string) => {
  const href = URL.createObjectURL(blob);
  clickLink(href, name);
  setTimeout(() => URL.revokeObjectURL(href), REVOKE_AFTER_MS);
};

export { saveBlob };
