/* @layer website-site @kind constants */
import { fillContact } from './fill-contact';
import type { LegalDoc, LegalDocId } from './legal-doc.type';
import privacy from '../legal-text/privacy.md?raw';
import terms from '../legal-text/terms.md?raw';

const LEGAL_UPDATED = '2026-10-26';

const LEGAL_DOCS: Readonly<Record<LegalDocId, LegalDoc>> = {
  privacy: { id: 'privacy', title: 'Privacy Policy', updated: LEGAL_UPDATED, source: fillContact(privacy) },
  terms: { id: 'terms', title: 'Terms of Service', updated: LEGAL_UPDATED, source: fillContact(terms) },
};

export { LEGAL_DOCS };
