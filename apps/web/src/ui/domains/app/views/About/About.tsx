/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { useAboutInfo } from './behavior/useAboutInfo';
import './About.css';

/** About page content (rendered inside a FullScreenLayer by the PageRouter). */
const About = () => {
  const rows = useAboutInfo();

  return (
    <Box className="about">
      <Box className="about__header">
        <Image className="about__logo" src="./logos/logo-256.png" alt="Relic of the Past" />
        <Text as="h2" className="about__title">Relic of the Past</Text>
      </Box>

      <Box className="about__body">
        {rows.map((row) => (
          <Box key={row.label} className="about__row">
            <Text className="about__label">{row.label}</Text>
            <Text className="about__value">{row.value}</Text>
          </Box>
        ))}
      </Box>

      <Text as="p" className="about__description">
        This is an unofficial fan-made/open-source project. It is not affiliated with, endorsed by,
        sponsored by, or approved by Nintendo. Nintendo, The Legend of Zelda, and related names,
        characters, music, artwork, and assets are trademarks and/or copyrights of Nintendo. No
        Nintendo-owned game assets are included in this repository.
      </Text>
    </Box>
  );
};

export { About };
