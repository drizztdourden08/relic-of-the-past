/* @layer website-site @kind component */
import { Box, Image, P, Title } from '@drizztdourden08/tessera/primitives';
import { publicFileUrl } from '../../public-file';
import { FeaturePlaceholder } from './sub-components/FeaturePlaceholder';
import type { FeatureRowProps } from './FeatureRow.type';
import './FeatureRow.css';

const FeatureRow = (props: FeatureRowProps) => {
  const { feature, flip } = props;
  const { title, body, media, mediaRatio, mediaAlt } = feature;

  return (
    <Box as="section" className={flip ? 'landing-feature landing-feature--flipped' : 'landing-feature'}>
      <Box className="landing-feature__media">
        {media ? (
          <Image
            className="landing-feature__shot"
            src={publicFileUrl(media)}
            alt={mediaAlt}
            aspectRatio={mediaRatio}
            loading="lazy"
          />
        ) : (
          <FeaturePlaceholder alt={mediaAlt} />
        )}
      </Box>
      <Box className="landing-feature__copy">
        <Title level={2} tone="primary" className="landing-feature__title">
          {title}
        </Title>
        <P className="landing-feature__body">{body}</P>
      </Box>
    </Box>
  );
};

export { FeatureRow };
