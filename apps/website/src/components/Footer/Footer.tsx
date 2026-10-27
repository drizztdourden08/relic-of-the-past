/* @layer website-site @kind component */
import { Box, FooterBar, P } from '../../design';
import { FOOTER_LINKS, FOOTER_TEXT } from './Footer.constants';
import './Footer.css';

const Footer = () => (
  <Box className="landing-end">
    <FooterBar note={FOOTER_TEXT.copyright(new Date().getFullYear())} links={FOOTER_LINKS} label={FOOTER_TEXT.linksLabel} />
    <P className="landing-end__legal">{FOOTER_TEXT.legal}</P>
  </Box>
);

export { Footer };
