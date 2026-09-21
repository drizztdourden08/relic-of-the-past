/* @layer renderer-components @kind component */
/** A section title with the reset-to-defaults action sitting beside it. */
import { Box } from '../../../../../design-system/primitives/Box';
import { Icon } from '../../../../../design-system/primitives/Icon';
import { Text } from '../../../../../design-system/primitives/Text';
import { ConfirmIconButton } from '../../../../../design-system/composites/ConfirmIconButton';

/** Counter-clockwise arrow: the arc, then the corner that heads it. */
const RESET_PATHS = ['M0.67 2.67V6.67H4.67', 'M2.34 10a6 6 0 1 0 1.42-6.24L0.67 6.67'];

const RESET_LABEL = 'Reset section to defaults';
const AT_DEFAULTS_LABEL = 'Section is already at its defaults';

interface SectionHeadingProps {
  title: string;
  /** How many settings in this section differ from their default. Zero rests the action. */
  changedCount: number;
  onReset: () => void;
}

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
