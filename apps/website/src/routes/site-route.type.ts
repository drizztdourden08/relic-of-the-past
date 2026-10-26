/* @layer website-site @kind types */
import type { LegalDocId } from '../legal';

type SiteRoute = { kind: 'home' } | { kind: 'legal'; doc: LegalDocId };

export type { SiteRoute };
