/* @layer renderer-components @kind component */
/**
 * Compact per-save-file checks strips for the home summary's run row: one
 * thin segmented bar per save file that holds a game, using the Checks
 * widget's own palette — green taken, yellow available now, grey left.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { SaveFileChecks } from './home-tab.type';
import './SaveFileChecksStrips.css';

interface SaveFileChecksStripsProps {
  files: SaveFileChecks[];
}

const stripTitle = (file: SaveFileChecks): string =>
  `File ${file.slot + 1}: ${file.taken} taken · ${file.available} available now · ${file.left} left of ${file.total}`;

const pct = (count: number, total: number): string =>
  total > 0 ? `${(count / total) * 100}%` : '0%';

const SaveFileChecksStrips = (props: SaveFileChecksStripsProps) => {
  const { files } = props;
  return (
    <Box className="home-summary__fact save-checks">
      <Text className="home-summary__label">Checks</Text>
      <Box className="save-checks__rows">
        {files.map((file) => (
          <Box key={file.slot} className="save-checks__row" title={stripTitle(file)}>
            <Text className="save-checks__slot">{file.slot + 1}</Text>
            <Box className="save-checks__bar">
              <Box className="save-checks__seg save-checks__seg--taken" style={{ width: pct(file.taken, file.total) }} />
              <Box className="save-checks__seg save-checks__seg--available" style={{ width: pct(file.available, file.total) }} />
            </Box>
            <Text className="save-checks__counts">
              <Box as="span" className="save-checks__count--taken">{file.taken}</Box>
              {' / '}
              <Box as="span" className="save-checks__count--available">{file.available}</Box>
              {' / '}
              <Box as="span" className="save-checks__count--left">{file.left}</Box>
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SaveFileChecksStrips };
export type { SaveFileChecksStripsProps };
