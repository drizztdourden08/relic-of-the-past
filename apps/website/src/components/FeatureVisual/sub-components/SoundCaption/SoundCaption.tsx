/* @layer website-site @kind component */
import { Box, Span } from '../../../../design';
import type { SoundCaptionProps } from './SoundCaption.type';
import './SoundCaption.css';

const SoundCaption = ({ label }: SoundCaptionProps) => (
  <Box className="sound-caption" aria-hidden="true">
    <Span key={label} className="sound-caption__chip">
      {label}
    </Span>
  </Box>
);

export { SoundCaption };
