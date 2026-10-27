/* @layer website-site @kind component */
import { Box, Link, P, Page, Prose, Title } from '../../design';
import { Footer } from '../../components/Footer';
import { LegalHeader } from '../../components/LegalHeader';
import { publicFileUrl } from '../../public-file';
import { LEGAL_PAGE_TEXT } from './LegalPage.constants';
import type { LegalPageProps } from './LegalPage.type';
import './LegalPage.css';

const LegalPage = ({ doc }: LegalPageProps) => (
  <Page className="legal">
    <LegalHeader />
    <Box as="main" className="legal__body">
      <Link href={publicFileUrl('')}>{LEGAL_PAGE_TEXT.back}</Link>
      <Title level={1} tone="primary" className="legal__title">
        {doc.title}
      </Title>
      <P className="legal__updated">{LEGAL_PAGE_TEXT.updated(doc.updated)}</P>
      <Prose source={doc.source} hideTitle />
    </Box>
    <Footer />
  </Page>
);

export { LegalPage };
