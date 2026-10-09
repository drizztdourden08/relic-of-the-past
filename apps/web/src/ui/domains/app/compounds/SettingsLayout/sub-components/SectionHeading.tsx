/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ConfirmIconButton } from '@drizztdourden08/tessera/composites';
import type { SectionHeadingProps } from '../SettingsLayout.type';
import { AT_DEFAULTS_LABEL, RESET_LABEL, RESET_PATHS } from './SectionHeading.constants';

const SectionHeading = (props: SectionHeadingProps) => {
  const { title, changedCount, onReset } = props;
  const resettable = changedCount > 0;

  return (
    <Box className="settings-layout__section-heading">
      <Text as="h2" className="settings-layout__section-title">{title}</Text>
      <ConfirmIconButton
        className="settings-layout__section-reset"
        icon={(
          <Icon
            size={13}
            paths={RESET_PATHS}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        label={resettable ? `${RESET_LABEL} (${changedCount} changed)` : AT_DEFAULTS_LABEL}
        confirmLabel="Reset to defaults"
        cancelLabel="Keep current settings"
        disabled={!resettable}
        onConfirm={onReset}
      />
    </Box>
  );
};

export { SectionHeading };
export type { SectionHeadingProps };
