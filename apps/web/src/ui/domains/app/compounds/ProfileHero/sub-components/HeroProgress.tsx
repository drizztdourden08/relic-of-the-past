/* @layer renderer-components @kind component */
/**
 * Glass progress panel: one row per save file holding a game, with a
 * segmented bar in the Checks widget's palette (green taken, yellow
 * available now, grey left), the percent done and the raw counts.
 */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import type { HeroProgressFile } from '../ProfileHero.type';
import './HeroProgress.css';

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

const HeroProgress = (props: { files: HeroProgressFile[] }) => {
  const { files } = props;
  return (
    <Box className="profile-hero__glass hero-progress">
      <Box className="hero-progress__head">
        <Text className="profile-hero__eyebrow">Progress</Text>
        <Box className="hero-progress__legend" aria-hidden="true">
          <Text as="span" className="hero-progress__key hero-progress__key--taken">Taken</Text>
          <Text as="span" className="hero-progress__key hero-progress__key--available">Available</Text>
          <Text as="span" className="hero-progress__key">Left</Text>
        </Box>
      </Box>
      {files.map((file) => <HeroProgressRow key={file.slot} file={file} />)}
    </Box>
  );
};

export { HeroProgress };
