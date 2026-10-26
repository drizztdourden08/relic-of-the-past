/* @layer website-site @kind logic */
import { CONTACT_EMAIL, CONTACT_TOKEN } from './contact.constants';

const fillContact = (source: string): string => source.replaceAll(CONTACT_TOKEN, CONTACT_EMAIL);

export { fillContact };
