/* @layer website-site @kind component */
import { Box, Image } from '../../design';
import { PUBLIC_FILES, publicFileUrl } from '../../public-file';
import { Fireflies } from './sub-components/Fireflies';
import { HeroRays } from './sub-components/HeroRays';
import './WorldBackdrop.css';

const WorldBackdrop = () => (
  <Box className="world-backdrop" aria-hidden="true">
    <Box className="world-backdrop__art">
      <Image className="world-backdrop__img" src={publicFileUrl(PUBLIC_FILES.heroArt)} alt="" aria-hidden="true" />
    </Box>
    <Box className="world-backdrop__rays">
      <HeroRays />
    </Box>
    <Fireflies />
  </Box>
);

export { WorldBackdrop };
