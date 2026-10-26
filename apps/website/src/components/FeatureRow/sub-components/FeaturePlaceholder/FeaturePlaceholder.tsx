/* @layer website-site @kind component */
import { Flex, Image, Span } from '@drizztdourden08/tessera/primitives';
import { PUBLIC_FILE_RATIOS, PUBLIC_FILES, publicFileUrl } from '../../../../public-file';
import { PLACEHOLDER_TEXT } from './FeaturePlaceholder.constants';
import type { FeaturePlaceholderProps } from './FeaturePlaceholder.type';
import './FeaturePlaceholder.css';

const FeaturePlaceholder = (props: FeaturePlaceholderProps) => {
  const { alt } = props;

  return (
    <Flex direction="column" align="center" justify="center" gap="md" className="landing-feature-placeholder" role="img" aria-label={alt}>
      <Image
        className="landing-feature-placeholder__mark"
        src={publicFileUrl(PUBLIC_FILES.mark)}
        alt=""
        aspectRatio={PUBLIC_FILE_RATIOS.mark}
        fit="contain"
      />
      <Span>{PLACEHOLDER_TEXT}</Span>
    </Flex>
  );
};

export { FeaturePlaceholder };
