/* @layer website-site @kind component */
import { Box, Flex, Image, Link, P, Title } from '@drizztdourden08/tessera/primitives';
import { PUBLIC_FILE_RATIOS, PUBLIC_FILES, publicFileUrl } from '../../public-file';
import { RELEASES_PAGE_URL } from '../../repo';
import { DownloadButton } from '../DownloadButton';
import { HERO_TEXT } from './Hero.constants';
import { Fireflies } from './sub-components/Fireflies';
import { HeroRays } from './sub-components/HeroRays';
import './Hero.css';

const Hero = () => (
  <Box as="header" className="landing-hero">
    <Image className="landing-hero__bg" src={publicFileUrl(PUBLIC_FILES.heroArt)} alt="" aria-hidden="true" />
    <Box className="landing-hero__scrim" aria-hidden="true" />
    <HeroRays />
    <Fireflies />
    <Flex direction="column" align="center" className="landing-hero__content">
      <Image
        className="landing-hero__mark"
        src={publicFileUrl(PUBLIC_FILES.mark)}
        alt=""
        aspectRatio={PUBLIC_FILE_RATIOS.mark}
        fit="contain"
        pixelated
      />
      <Title level={1} className="landing-hero__title">
        <Image
          className="landing-hero__wordmark"
          src={publicFileUrl(PUBLIC_FILES.wordmark)}
          alt={HERO_TEXT.name}
          aspectRatio={PUBLIC_FILE_RATIOS.wordmark}
          fit="contain"
        />
      </Title>
      <P className="landing-hero__tagline">{HERO_TEXT.tagline}</P>
      <DownloadButton />
      <Link href={RELEASES_PAGE_URL} className="landing-hero__all-releases">
        {HERO_TEXT.allReleases}
      </Link>
      <P className="landing-hero__note">{HERO_TEXT.note}</P>
    </Flex>
  </Box>
);

export { Hero };
