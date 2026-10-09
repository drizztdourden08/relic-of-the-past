/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import type { HeroProgressFile } from '../ProfileHero.type';

const share = (count: number, total: number): number => (total > 0 ? (count / total) * 100 : 0);

const fileLabel = (file: HeroProgressFile): string => file.name ?? `File ${file.slot + 1}`;

const rowTitle = (file: HeroProgressFile): string =>
  `${fileLabel(file)} (file ${file.slot + 1}): ${file.taken} taken, ${file.available} available now, ${file.left} left of ${file.total}`;

const HeroProgressRow = (props: { file: HeroProgressFile }) => {
  const { file } = props;
  return (
    <Box className="hero-progress__row" title={rowTitle(file)}>
      <Text className="hero-progress__file">{fileLabel(file)}</Text>
      <ProgressBar
        className="hero-progress__bar"
        value={file.taken}
        secondaryValue={file.taken + file.available}
        max={Math.max(1, file.total)}
        tone="secondary"
        secondaryTone="warning"
        label={rowTitle(file)}
      />
      <Text className="hero-progress__pct">{Math.floor(share(file.taken, file.total))}%</Text>
      <Text className="hero-progress__count">{file.taken}/{file.total}</Text>
    </Box>
  );
};

export { HeroProgressRow };
