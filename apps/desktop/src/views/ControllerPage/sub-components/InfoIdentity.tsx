/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { BoxProps } from '../ControllerPage.type';

const InfoIdentity = ({ page }: BoxProps) => {
  const { name, brandIcon, entry } = page;
  return (
    <Box className="controller-page__identity">
      {brandIcon && <Image src={brandIcon} alt="" draggable={false} className="controller-page__brand" />}
      <Box className="controller-page__title">
        <Text className="controller-page__name">{name}</Text>
        <Text className="controller-page__sub">{`${entry.family ?? 'generic'} family · SDL type ${entry.sdlType ?? 'unknown'}`}</Text>
      </Box>
    </Box>
  );
};

export { InfoIdentity };
