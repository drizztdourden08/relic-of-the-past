/* @layer website-site @kind component */
import { Box } from '../../primitives/Box';
import { Link } from '../../primitives/Link';
import { Span } from '../../primitives/Text';
import type { FooterBarProps } from './FooterBar.type';
import './FooterBar.css';

const FooterBar = ({ note, links = [], label }: FooterBarProps) => (
  <Box as="footer" className="ds-footer">
    <Box className="ds-footer__lead">
      {note !== undefined && (
        <Span tone="dim" className="ds-footer__note">
          {note}
        </Span>
      )}
    </Box>
    {links.length > 0 && (
      <Box as="nav" className="ds-footer__links" aria-label={label}>
        {links.map((link) => (
          <Link key={link.id} href={link.href} external={link.external} tone="secondary" variant="subtle" className="ds-footer__link">
            {link.label}
          </Link>
        ))}
      </Box>
    )}
  </Box>
);

export { FooterBar };
