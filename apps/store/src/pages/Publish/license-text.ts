/* @layer store-site @kind logic */
import { LICENSE_TEXT } from './license-text.constants';

const licenseText = (text: string | { readonly key: string }): string =>
  (typeof text === 'string' ? text : (LICENSE_TEXT[text.key] ?? text.key));

export { licenseText };
