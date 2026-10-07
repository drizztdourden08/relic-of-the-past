/* @layer renderer-components @kind component */
/**
 * The app's search mark: a gold magnifying glass with a permanent soft glow and
 * a small gold star that twinkles over the lens once every --duration-twinkle.
 * The star's size and spot scale with the glass, so it reads the same at any size.
 */
import type { CSSProperties } from 'react';
import { Box } from '../../primitives/Box';
import { Icon } from '../../primitives/Icon';
import { Text } from '../../primitives/Text';
import { SEARCH_ICON_PATHS } from './SearchSpark.constants';
import './SearchSpark.css';

interface SearchSparkProps {
  /** Glass size in px. */
  size?: number;
  className?: string;
}

const SearchSpark = (props: SearchSparkProps) => {
  const { size = 14, className = '' } = props;
  const style = { '--search-spark-size': `${size}px` } as CSSProperties;
  return (
    <Box as="span" className={`search-spark${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      <Icon paths={SEARCH_ICON_PATHS} size={size} />
      <Text as="span" className="search-spark__star">✦</Text>
    </Box>
  );
};

export { SearchSpark };
export type { SearchSparkProps };
