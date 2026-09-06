/* @layer renderer-app @kind component */
import { Box, Text } from '../../../../../../design-system/primitives';
import { TYPE_SCALE, SPACE_SCALE, RADIUS_SCALE, SHADOW_SCALE } from '../../DesignGallery.constants';
import { Swatch } from '../Swatch';
import { Specimen } from '../Specimen';

/** Foundations: type / spacing / radius / elevation scales. */
const ScaleStory = () => (
  <Box className="dg-stack">
    <Specimen label="Type scale" hint="Tight 5-step scale. Densify with weight & color, not new sizes.">
      <Box className="dg-type">
        {TYPE_SCALE.map(t => (
          <Text key={t.cssVar} className="dg-type__row" style={{ fontSize: `var(${t.cssVar})` }}>
            {t.name} · {t.value} · The quick brown fox jumps
          </Text>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Spacing" hint="One scale for gap / margin / padding.">
      <Box className="dg-scale">
        {SPACE_SCALE.map(t => (
          <Box key={t.cssVar} className="dg-scale__item">
            <Box className="dg-scale__bar" style={{ width: `var(${t.cssVar})`, height: `var(${t.cssVar})` }} />
            <Text className="dg-scale__label">{t.name} · {t.value}</Text>
          </Box>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Radius">
      <Box className="dg-scale">
        {RADIUS_SCALE.map(t => (
          <Box key={t.cssVar} className="dg-scale__item">
            <Box className="dg-radius-box" style={{ borderRadius: `var(${t.cssVar})` }} />
            <Text className="dg-scale__label">{t.name} · {t.value}</Text>
          </Box>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Elevation (three shadows + one blur)">
      <Box className="dg-swatch-grid">
        {SHADOW_SCALE.map(t => <Swatch key={t.cssVar} token={t} kind="shadow" />)}
      </Box>
    </Specimen>
  </Box>
);

export { ScaleStory };
