/* @layer renderer-components @kind component */
import { useState } from 'react';
import { PressedGrid } from '@drizztdourden08/tessera/composites';
import { Box, Card, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { UNMAPPED_REASON } from '../ControllerPage.constants';
import type { BoxProps } from '../ControllerPage.type';
import { buttonModelOf } from '../behavior/button-model-of';
import { extrasModelOf } from '../behavior/extras-model-of';
import { BUTTON_TABS } from './ButtonsBox.constants';
import { ControllerRawBytes } from './ControllerRawBytes';
import { DebugLine } from './DebugLine';

const ButtonsBox = ({ page }: BoxProps) => {
  const { resolved, state, pad } = page;
  const [tab, setTab] = useState<string>(BUTTON_TABS[0].id);
  const buttons = buttonModelOf(resolved?.controls ?? [], state);
  const extras = extrasModelOf(pad.extras);

  return (
    <Card title="Buttons" className="controller-page__buttons">
      <Box className="controller-page__stack">
        <Tabs tabs={BUTTON_TABS} activeTab={tab} onTabChange={setTab} />
        {tab === 'raw' ? (
          <ControllerRawBytes state={state} />
        ) : (
          <Box className="controller-page__stack">
            {resolved
              ? <PressedGrid items={buttons.items} pressed={buttons.pressed} />
              : <Text className="controller-page__note">{UNMAPPED_REASON}</Text>}
            <Text className="controller-page__note">{extras.items.length > 0 ? 'Other inputs' : 'Other inputs: none on this pad'}</Text>
            {extras.items.length > 0 && <PressedGrid items={extras.items} pressed={extras.pressed} />}
          </Box>
        )}
        <DebugLine state={state} />
      </Box>
    </Card>
  );
};

export { ButtonsBox };
