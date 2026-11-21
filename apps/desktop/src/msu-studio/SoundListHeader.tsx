/* @layer renderer-components @kind component */
import { Button, SectionHeader, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import type { SoundListHeaderProps } from './SoundListHeader.type';

const SoundListHeader = (props: SoundListHeaderProps) => {
  const { title, sounding, status, statusOk, onStop } = props;
  const t = useT();

  return (
    <>
      <SectionHeader
        title={title}
        action={sounding ? <Button variant="tertiary" size="sm" onClick={onStop}>{t('msu-studio:sound.stop-preview')}</Button> : null}
      />
      {status != null && <Text className={`msu-status${statusOk ? '' : ' msu-status--error'}`}>{status}</Text>}
    </>
  );
};

export { SoundListHeader };
