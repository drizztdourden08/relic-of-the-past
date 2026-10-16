/* @layer renderer-components @kind component */
import { Box, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { StudioSearchProps } from './StudioSearch.type';
import './StudioSearch.css';

const StudioSearch = (props: StudioSearchProps) => {
  const { value, label, placeholder, onChange } = props;

  return (
    <Box className="studio-search">
      <SearchInput value={value} onChange={onChange} placeholder={placeholder} aria-label={label} />
    </Box>
  );
};

export { StudioSearch };
