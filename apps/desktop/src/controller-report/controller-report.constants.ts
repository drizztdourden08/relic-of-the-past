/* @layer renderer-app @kind constants */
import type { DeviceCardAction, GlyphSource, RumbleTest } from '@drizztdourden08/brock-input/renderer';
import { CONTROLLER_ICON_MAP } from '@app/input/controller-families/controller-icon-map.constants';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { previewHapticPattern } from '@app/input/haptic-bridge/preview-haptic-pattern';
import { useControllerReportStore } from './useControllerReportStore';

const REPORT_LABEL = 'Report this controller as not working';

const DEVICE_CARD_ACTIONS: readonly DeviceCardAction[] = [
  {
    id: 'report',
    label: REPORT_LABEL,
    icon: 'bug',
    variant: 'ghost',
    onSelect: (entry) => useControllerReportStore.getState().open(entry.deviceKey),
  },
];

const RUMBLE_TESTS: readonly RumbleTest[] = [
  { label: 'Sword Hit', play: (deviceKey) => previewHapticPattern(deviceKey, 'swordHitEnemy') },
];

const GLYPH_SOURCE: GlyphSource = {
  button: (glyph) => getButtonIconUrl(glyph),
  controller: (family) => CONTROLLER_ICON_MAP[family],
};

export { DEVICE_CARD_ACTIONS, GLYPH_SOURCE, RUMBLE_TESTS };
