/* @layer renderer-components @kind component */
/**
 * Pixel-art play-mode badge: one glance says what kind of playthrough this
 * profile is. Renders the mode's art when the asset exists, otherwise a
 * same-footprint labeled chip, so nothing shifts when the art arrives.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Image } from '../../../../design-system/primitives/Image';
import { Text } from '../../../../design-system/primitives/Text';
import { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS, modeBadgeSrc } from './ModeBadge.constants';
import type { ModeBadgeProps } from './ModeBadge.type';
import './ModeBadge.css';

const ModeBadge = (props: ModeBadgeProps) => {
  const { mode, className = '' } = props;
  const label = MODE_BADGE_LABELS[mode];
  const src = modeBadgeSrc(mode);

  return (
    <Box
      as="span"
      className={`mode-badge mode-badge--${mode}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`${label} mode`}
      title={`${label} mode`}
    >
      {src
        ? <Image className="mode-badge__img" src={src} alt="" />
        : <Text as="span" className="mode-badge__monogram" aria-hidden="true">{MODE_BADGE_MONOGRAMS[mode]}</Text>}
    </Box>
  );
};

export { ModeBadge };
