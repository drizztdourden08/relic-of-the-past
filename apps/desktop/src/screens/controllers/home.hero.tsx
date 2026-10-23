/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { RescanButton } from '@app/compounds/RescanButton';
import { ControllerDirectory, useDirectoryHero } from '@app/views/ControllerDirectory';
import { PAD_PARAM } from '@app/views/ControllerPads';
import { PADS_ROUTE } from './controllers.constants';

const meta: ScreenMeta = {
  title: 'Directory',
  icon: 'gamepad-2',
  keywords: ['controller', 'gamepad', 'directory', 'mapping', 'sdl', 'vid', 'pid', 'rescan'],
  hero: { size: 'compact' },
};

const ControllersHero = (props: HeroProps) => {
  const { slots, open } = props;
  const { Art, Eyebrow, Title, Tools, Facts } = slots;
  const { facts, hint, isRescanPending, onRescan } = useDirectoryHero();
  const openController = useCallback((deviceKey: string) => open(PADS_ROUTE, { [PAD_PARAM]: deviceKey }), [open]);

  return (
    <>
      <Art kind="none" />
      <Eyebrow>Controllers</Eyebrow>
      <Title>Directory</Title>
      <Tools>
        <RescanButton isPending={isRescanPending} onRescan={onRescan} />
      </Tools>
      <Facts rows={facts} />
      <Stack gap="md" align="stretch">
        <Text as="p" tone="muted">{hint}</Text>
        <ControllerDirectory onOpenController={openController} />
      </Stack>
    </>
  );
};

export default ControllersHero;
export { meta };
