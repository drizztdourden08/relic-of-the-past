/* @layer renderer-components @kind component */
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import type { FileControlsProps } from './FileControls.type';

const FileControls = (props: FileControlsProps) => {
  const { filter, coveredCount, supersededOnly, onFilterChange, onSupersededOnlyChange } = props;

  return (
    <>
      <SearchInput grow={false} size="sm" value={filter} onChange={onFilterChange} placeholder="intro, pcm..." aria-label="Find a file" />
      {coveredCount > 0 && (
        <Checkbox
          checked={supersededOnly}
          label={`Superseded originals only (${coveredCount})`}
          onChange={onSupersededOnlyChange}
        />
      )}
    </>
  );
};

export { FileControls };
