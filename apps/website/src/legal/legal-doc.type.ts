/* @layer website-site @kind types */
type LegalDocId = 'privacy' | 'terms';

type LegalDoc = {
  id: LegalDocId;
  title: string;
  updated: string;
  source: string;
};

export type { LegalDoc, LegalDocId };
