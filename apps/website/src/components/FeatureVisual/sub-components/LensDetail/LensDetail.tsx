/* @layer website-site @kind component */
import { Box, Span } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import type { LensDetailProps } from './LensDetail.type';
import './LensDetail.css';

const LensDetail = ({ shot, label }: LensDetailProps) => (
  <Box className="lens-detail">
    <ShotImage shot={shot} alt={`${label}: ${shot.alt}`} className="lens-detail__image" />
    <Span className="lens-detail__label">{label}</Span>
  </Box>
);

export { LensDetail };
