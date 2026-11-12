/* @layer website-site @kind constants */
import { fillContact } from './fill-contact';
import type { LegalDoc, LegalDocId } from './legal-doc.type';
import privacy from '../../content/privacy.md?raw';
import terms from '../../content/terms.md?raw';

const LEGAL_UPDATED = '2026-10-27';

const LEGAL_DOCS: Readonly<Record<LegalDocId, LegalDoc>> = {
  privacy: { id: 'privacy', title: 'Privacy Policy', updated: LEGAL_UPDATED, source: fillContact(privacy) },
  terms: { id: 'terms', title: 'Terms of Service', updated: LEGAL_UPDATED, source: fillContact(terms) },
};

export { LEGAL_DOCS };
