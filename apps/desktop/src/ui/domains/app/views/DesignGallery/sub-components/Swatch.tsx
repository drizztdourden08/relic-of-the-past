/* @layer renderer-app @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import type { TokenSpec } from '../DesignGallery.constants';

/** One token chip: a color/elevation preview box + its name, var, value, note. */
const Swatch = ({ token, kind }: { token: TokenSpec; kind?: 'color' | 'shadow' }) => {
  const { name, cssVar, value, note } = token;
  const previewStyle = kind === 'shadow'
    ? { background: 'var(--c-surface)', boxShadow: `var(${cssVar})` }
    : { background: `var(${cssVar})` };
  return (
    <Box className="dg-swatch">
      <Box className="dg-swatch__chip" style={previewStyle} />
      <Box className="dg-swatch__meta">
        <Text className="dg-swatch__name">{name}</Text>
        <Text as="code" className="dg-swatch__var">{cssVar}</Text>
        <Text className="dg-swatch__value">{value}</Text>
        {note && <Text className="dg-swatch__note">{note}</Text>}
      </Box>
    </Box>
  );
};

export { Swatch };
