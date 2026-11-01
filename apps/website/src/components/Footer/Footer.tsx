/* @layer website-site @kind component */
import { Fragment } from 'react';
import { Box, Link } from '../../design';
import { FOOTER_LINKS, FOOTER_TEXT } from './Footer.constants';
import './Footer.css';

const Footer = () => (
  <Box as="footer" className="landing-end">
    <Box as="p">
      {FOOTER_TEXT.copyright(new Date().getFullYear())}
      {FOOTER_LINKS.map((link) => (
        <Fragment key={link.id}>
          {FOOTER_TEXT.separator}
          <Link href={link.href} className="landing-end__link">
            {link.label}
          </Link>
        </Fragment>
      ))}
    </Box>
    <Box as="p" className="landing-end__legal">
      {FOOTER_TEXT.legal}
    </Box>
  </Box>
);

export { Footer };
