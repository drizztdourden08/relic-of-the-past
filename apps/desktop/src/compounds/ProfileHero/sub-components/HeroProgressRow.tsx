/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import type { HeroProgressFile } from '../ProfileHero.type';

const share = (count: number, total: number): number => (total > 0 ? (count / total) * 100 : 0);

const fileLabel = (file: HeroProgressFile, t: I18n['t']): string => file.name ?? t('compounds:profile-hero.file', { n: file.slot + 1 });

const rowTitle = (file: HeroProgressFile, t: I18n['t']): string => t('compounds:profile-hero.row-title', {
  file: fileLabel(file, t), n: file.slot + 1, taken: file.taken, available: file.available, left: file.left, total: file.total,
});

const HeroProgressRow = (props: { file: HeroProgressFile }) => {
  const t = useT();
  const { file } = props;
  return (
    <Box className="hero-progress__row" title={rowTitle(file, t)}>
      <Text className="hero-progress__file">{fileLabel(file, t)}</Text>
      <ProgressBar
        className="hero-progress__bar"
        value={file.taken}
        secondaryValue={file.taken + file.available}
        max={Math.max(1, file.total)}
        tone="secondary"
        secondaryTone="warning"
        label={rowTitle(file, t)}
      />
      <Text className="hero-progress__pct">{Math.floor(share(file.taken, file.total))}%</Text>
      <Text className="hero-progress__count">{file.taken}/{file.total}</Text>
    </Box>
  );
};

export { HeroProgressRow };
