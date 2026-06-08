/* @layer renderer-components @kind component */
﻿import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import './SettingsSection.css';
import { type SettingsSectionProps } from './SettingsSection.type';

const SettingsSection = (props: SettingsSectionProps) => {
  const { title, description, children } = props;

  return (
    <Box as="section" className="settings-section">
      <Box className="settings-section__header">
        <Text as="h3" className="settings-section__title">{title}</Text>
        {description && <Text as="p" className="settings-section__desc">{description}</Text>}
      </Box>
      <Box className="settings-section__content">
        {children}
      </Box>
    </Box>
  );
};

export {
  SettingsSection,
};
