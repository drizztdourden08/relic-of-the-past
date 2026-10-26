/* @layer website-site @kind component */
import { Box, P, Title } from '@drizztdourden08/tessera/primitives';
import { ShotImage } from '../../../ShotImage';
import type { FeatureCardProps } from './FeatureCard.type';
import './FeatureCard.css';

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const { title, body, shot, compare } = feature;

  const copy = (
    <>
      <Title level={3} tone="primary" className="feature-card__title">
        {title}
      </Title>
      <P className="feature-card__body">{body}</P>
    </>
  );

  if (shot.pending) {
    return (
      <Box as="li" className="feature-card">
        <Box className="feature-card__panel">{copy}</Box>
      </Box>
    );
  }

  return (
    <Box as="li" className="feature-card">
      <Box className={compare ? 'feature-card__shots feature-card__shots--compare' : 'feature-card__shots'}>
        <ShotImage shot={shot} className="feature-card__shot" />
        {compare ? <ShotImage shot={compare} className="feature-card__shot" /> : null}
      </Box>
      {copy}
    </Box>
  );
};

export { FeatureCard };
