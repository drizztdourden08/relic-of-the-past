/* @layer renderer-components @kind component */
import { Box, Image, Status } from '@drizztdourden08/tessera/primitives';
import type { SettingsSectionRow } from '@drizztdourden08/tessera/composites';
import type { RequiredInput } from '../controls-settings/controls-settings.type';

const requiredInputRows = (inputs: readonly RequiredInput[]): SettingsSectionRow[] =>
  inputs.map((input) => ({
    id: `required-${input.type}`,
    title: input.label,
    noDescription: true,
    hint: input.connected ? `${input.label} is connected.` : `${input.label} is not connected.`,
    input: {
      kind: 'custom',
      control: (
        <Box className="controls-options__input">
          <Image src={input.iconSrc} alt="" className="controls-options__icon" />
          <Status tone={input.connected ? 'success' : 'danger'} dot>{input.connected ? 'Connected' : 'Not connected'}</Status>
        </Box>
      ),
    },
  }));

export { requiredInputRows };
