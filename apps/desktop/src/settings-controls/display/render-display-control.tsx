/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { AspectRatioControl } from '../AspectRatioControl';
import { CascadeToggle } from './CascadeToggle';
import { SyncedRateRow } from './SyncedRateRow';
import { TargetRateRow } from './TargetRateRow';
import { VsyncRow } from './VsyncRow';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, CASCADE_KEYS } from './display.constants';
import type { ControlContext } from '../settings-controls.type';
import type { CascadeKey } from './display.type';

const renderAspectRatio = (ctx: ControlContext): ReactNode => {
  const { settings, onChange } = ctx;
  const { options, widePresets, tallPresets } = aspectChoices(settings);
  return (
    <AspectRatioControl
      label="Aspect Ratio"
      description="Screen aspect ratio for the game content."
      value={settings.aspectRatio}
      options={options}
      widePresets={widePresets}
      tallPresets={tallPresets}
      descriptions={ASPECT_DESCRIPTIONS}
      recommendedValue="auto"
      recommendedNote="Best for most setups. Follows your window and adapts to notch or resize."
      customW={settings.customAspectW}
      customH={settings.customAspectH}
      ratioKey="aspectRatio"
      wKey="customAspectW"
      hKey="customAspectH"
      renderIntoNotch={settings.renderIntoNotch}
      onChange={onChange}
    />
  );
};

const renderDisplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (CASCADE_KEYS.has(key)) return <CascadeToggle settingKey={key as CascadeKey} {...ctx} />;
  switch (key) {
    case 'aspectRatio': return renderAspectRatio(ctx);
    case 'vsync': return <VsyncRow {...ctx} />;
    case 'syncedRefreshRate': return <SyncedRateRow {...ctx} />;
    case 'syncedRefreshRateHz': return <TargetRateRow {...ctx} />;
    default: return null;
  }
};

export { renderDisplayControl };
