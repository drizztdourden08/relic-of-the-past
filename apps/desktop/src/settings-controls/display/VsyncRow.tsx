/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { effectiveHz } from '@drizztdourden08/brock-display';
import { useRefreshRate } from '@drizztdourden08/brock-display/renderer';
import { ControlRow } from '../ControlRow';
import { useSettingItemText } from '../ControlRow/behavior/useSettingItemText';
import { refreshAdvisory } from './refresh-advisory';
import type { ControlContext } from '../settings-controls.type';

const VsyncRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const { title, hint, description } = useSettingItemText('vsync');
  const advisory = refreshAdvisory(effectiveHz(useRefreshRate()));
  const handleChange = useCallback((vsync: boolean) => onChange({ vsync }), [onChange]);
  return (
    <ControlRow
      id="vsync"
      title={title}
      hint={hint}
      description={`${description ?? ''}${advisory}`}
      input={{ kind: 'toggle', value: settings.vsync, onChange: handleChange }}
      disabled={disabled}
    />
  );
};

export { VsyncRow };
