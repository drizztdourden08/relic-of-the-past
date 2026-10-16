/* @layer renderer-components @kind component */
import { Checkbox } from '@drizztdourden08/tessera/primitives';
import { StudioSearch } from '@app/studio';
import type { FileControlsProps } from './FileControls.type';

const FileControls = (props: FileControlsProps) => {
  const { filter, coveredCount, supersededOnly, onFilterChange, onSupersededOnlyChange } = props;

  return (
    <>
      <StudioSearch value={filter} onChange={onFilterChange} placeholder="intro, pcm..." label="Find a file" />
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
