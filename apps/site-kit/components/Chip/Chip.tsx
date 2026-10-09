/* @layer site-kit @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { NEW_TAB } from './Chip.constants';
import type { ChipProps } from './Chip.type';
import './Chip.css';

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
export type { ChipProps, ChipTone } from './Chip.type';
