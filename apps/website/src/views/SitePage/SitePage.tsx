/* @layer website-site @kind component */
import { LEGAL_DOCS } from '../../legal';
import { LandingPage } from '../LandingPage';
import { LegalPage } from '../LegalPage';
import type { SitePageProps } from './SitePage.type';

const SitePage = ({ route }: SitePageProps) =>
  route.kind === 'legal' ? <LegalPage doc={LEGAL_DOCS[route.doc]} /> : <LandingPage />;

export { SitePage };
