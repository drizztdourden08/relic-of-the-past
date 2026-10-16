/* @layer renderer-components @kind component */
import { Checkbox, SearchInput } from '@drizztdourden08/tessera/primitives';
import { SOUND_FILTER_PLACEHOLDER } from './msu.constants';
import type { SoundPanelControlsProps } from './SoundPanelControls.type';

const SoundPanelControls = (props: SoundPanelControlsProps) => {
  const { tabs, unreachableCount, filter, showUnreachable, onFilterChange, onShowUnreachableChange } = props;

  return (
    <>
      {tabs}
      <SearchInput grow={false} size="sm" value={filter} onChange={onFilterChange} placeholder={SOUND_FILTER_PLACEHOLDER} aria-label="Find a sound" />
      {unreachableCount > 0 && (
        <Checkbox
          checked={showUnreachable}
          onChange={onShowUnreachableChange}
          label={`Show ${unreachableCount} unreachable ids`}
        />
      )}
    </>
  );
};

export { SoundPanelControls };
