/* @layer renderer-components @kind component */
import { StatRow } from '../../../../../../../design-system/primitives/StatRow';
import { Box } from '../../../../../../../design-system/primitives/Box';
import type { LanguageMetaPanelProps } from '../language-detail.type';

const ENCODER_LABELS: Record<string, string> = {
  org: 'Original (US/JP)',
  new: 'European (EU)',
};

const LanguageMeta = (props: LanguageMetaPanelProps) => {
  const { meta, name } = props;
  return (
    <Box className="language-detail__meta">
      <StatRow label="Name" value={name} />
      <StatRow label="Code" value={meta.code} mono />
      <StatRow label="Glyphs" value={meta.glyphCount} mono />
      <StatRow label="Lines" value={meta.lineCount} mono />
      <StatRow label="Text format" value={ENCODER_LABELS[meta.encoder] ?? meta.encoder} />
      <StatRow label="Source" value={meta.source} />
    </Box>
  );
};

export { LanguageMeta };
