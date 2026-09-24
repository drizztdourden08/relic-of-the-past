/* @layer sanctuary-site @kind component */
/**
 * The site's one pill: a short mono label tinted by tone. The access, file-type and
 * issue chips are each a mapping from their domain value onto a tone of this.
 */
import type { HTMLAttributes, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import './Chip.css';

type ChipTone = 'neutral' | 'gold' | 'green' | 'info' | 'warning' | 'danger' | 'muted';

type ChipProps = HTMLAttributes<HTMLElement> & {
  tone?: ChipTone;
  /** Renders as an anchor to this address, opened in a new tab. */
  href?: string;
  className?: string;
  children?: ReactNode;
};

/** Spread, not written as attributes: the Box primitive types anchor attributes loosely. */
const NEW_TAB = { target: '_blank', rel: 'noreferrer' };

const Chip = (props: ChipProps) => {
  const { tone = 'neutral', href, className = '', children, ...rest } = props;
  const cls = `chip${className ? ` ${className}` : ''}`;
  if (href) {
    return (
      <Box as="a" href={href} className={`${cls} chip--link`} data-tone={tone} {...NEW_TAB} {...rest}>
        {children}
      </Box>
    );
  }
  return (
    <Box as="span" className={cls} data-tone={tone} {...rest}>
      {children}
    </Box>
  );
};

export { Chip };
export type { ChipProps, ChipTone };
