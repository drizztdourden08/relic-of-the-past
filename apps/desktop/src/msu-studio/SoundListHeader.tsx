/* @layer renderer-components @kind component */
import { Button, SectionHeader, Text } from '@drizztdourden08/tessera/primitives';
import type { SoundListHeaderProps } from './SoundListHeader.type';

const SoundListHeader = (props: SoundListHeaderProps) => {
  const { title, sounding, status, statusOk, onStop } = props;

  return (
    <>
      <SectionHeader
        title={title}
        action={sounding ? <Button variant="tertiary" size="sm" onClick={onStop}>Stop preview</Button> : null}
      />
      {status != null && <Text className={`msu-status${statusOk ? '' : ' msu-status--error'}`}>{status}</Text>}
    </>
  );
};

export { SoundListHeader };
