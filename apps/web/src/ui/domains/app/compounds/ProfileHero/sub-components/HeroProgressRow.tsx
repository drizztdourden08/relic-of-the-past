/* @layer renderer-components @kind component */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import type { HeroProgressFile } from '../ProfileHero.type';

const share = (count: number, total: number): number => (total > 0 ? (count / total) * 100 : 0);

const fileLabel = (file: HeroProgressFile): string => file.name ?? `File ${file.slot + 1}`;

const rowTitle = (file: HeroProgressFile): string =>
  `${fileLabel(file)} (file ${file.slot + 1}): ${file.taken} taken, ${file.available} available now, ${file.left} left of ${file.total}`;

const HeroProgressRow = (props: { file: HeroProgressFile }) => {
  const { file } = props;
  const takenPct = share(file.taken, file.total);
  return (
    <Box className="hero-progress__row" title={rowTitle(file)}>
      <Text className="hero-progress__file">{fileLabel(file)}</Text>
      <Box className="hero-progress__bar">
        <Box className="hero-progress__seg hero-progress__seg--taken" style={{ width: `${takenPct}%` }} />
        <Box
          className="hero-progress__seg hero-progress__seg--available"
          style={{ width: `${share(file.available, file.total)}%` }}
        />
      </Box>
      <Text className="hero-progress__pct">{Math.floor(takenPct)}%</Text>
      <Text className="hero-progress__count">{file.taken}/{file.total}</Text>
    </Box>
  );
};

export { HeroProgressRow };
