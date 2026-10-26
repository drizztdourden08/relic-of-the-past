/* @layer website-site @kind component */
import { Box, P } from '@drizztdourden08/tessera/primitives';
import { SiteFooter } from '@drizztdourden08/tessera/composites';
import { FOOTER_LINKS, FOOTER_TEXT } from './Footer.constants';
import './Footer.css';

const Footer = () => (
  <Box className="landing-end">
    <SiteFooter note={FOOTER_TEXT.copyright(new Date().getFullYear())} links={FOOTER_LINKS} />
    <P className="landing-end__legal">{FOOTER_TEXT.legal}</P>
  </Box>
);

export { Footer };
