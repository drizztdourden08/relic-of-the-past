/* @layer renderer-app @kind component */
/**
 * DesignGallery — in-app reference for the design language (a custom, minimal
 * "storybook"). Renders the canonical token palette + scales + live control and
 * container specimens so the system can be reviewed visually. Reachable from
 * the title-bar Advanced menu.
 */
import { Box, Text } from '../../../../design-system/primitives';
import { COLOR_GROUPS, TYPE_SCALE, SPACE_SCALE, RADIUS_SCALE, SHADOW_SCALE } from './DesignGallery.constants';
import { GallerySection } from './sub-components/GallerySection';
import { GalleryDemos } from './sub-components/GalleryDemos';
import { Swatch } from './sub-components/Swatch';
import './DesignGallery.css';

const DesignGallery = () => (
  <Box className="dg-root">
    <Box className="dg-header">
      <Text as="h1" className="dg-header__title">Design Language</Text>
      <Text className="dg-header__sub">
        One background family · one blur · <Text as="b">gold = primary</Text> (selection/active/CTA) ·
        <Text as="b"> green = secondary</Text> (positive/go) · red=danger · amber=warning · blue=info
      </Text>
    </Box>

    {COLOR_GROUPS.map(group => (
      <GallerySection key={group.title} title={group.title} description={group.description}>
        <Box className="dg-swatch-grid">
          {group.tokens.map(t => <Swatch key={t.cssVar} token={t} />)}
        </Box>
      </GallerySection>
    ))}

    <GallerySection title="Type scale" description="Tight 5-step scale. Densify with weight & color, not new sizes.">
      <Box className="dg-type">
        {TYPE_SCALE.map(t => (
          <Text key={t.cssVar} className="dg-type__row" style={{ fontSize: `var(${t.cssVar})` }}>
            {t.name} · {t.value} — The quick brown fox jumps
          </Text>
        ))}
      </Box>
    </GallerySection>

    <GallerySection title="Spacing" description="One scale for gap / margin / padding.">
      <Box className="dg-scale">
        {SPACE_SCALE.map(t => (
          <Box key={t.cssVar} className="dg-scale__item">
            <Box className="dg-scale__bar" style={{ width: `var(${t.cssVar})`, height: `var(${t.cssVar})` }} />
            <Text className="dg-scale__label">{t.name} · {t.value}</Text>
          </Box>
        ))}
      </Box>
    </GallerySection>

    <GallerySection title="Radius">
      <Box className="dg-scale">
        {RADIUS_SCALE.map(t => (
          <Box key={t.cssVar} className="dg-scale__item">
            <Box className="dg-radius-box" style={{ borderRadius: `var(${t.cssVar})` }} />
            <Text className="dg-scale__label">{t.name} · {t.value}</Text>
          </Box>
        ))}
      </Box>
    </GallerySection>

    <GallerySection title="Elevation — three shadows + one blur">
      <Box className="dg-swatch-grid">
        {SHADOW_SCALE.map(t => <Swatch key={t.cssVar} token={t} kind="shadow" />)}
      </Box>
    </GallerySection>

    <GallerySection title="Controls & containers" description="Selection is always gold; green is reserved for positive/go.">
      <GalleryDemos />
    </GallerySection>
  </Box>
);

export { DesignGallery };
