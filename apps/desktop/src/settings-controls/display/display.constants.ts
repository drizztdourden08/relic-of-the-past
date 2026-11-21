/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { RatioKeys } from '../ratio-patch.type';

const REQUIRES_LINEAR = new Set(['21:9']);
const REQUIRES_ULTRAWIDE = new Set(['32:9']);
const TALL_PRESET_VALUES = new Set(['4:5', '3:4', '10:16', '9:16', '9:21', '9:32']);
const TALL_ULTRAWIDE_PRESET = '9:32';
const TALL_ULTRAWIDE_FALLBACK = '9:21';

const TALL_PRESETS = [
  { value: '4:5', label: '4:5' },
  { value: '3:4', label: '3:4' },
  { value: '10:16', label: '10:16' },
  { value: '9:16', label: '9:16' },
  { value: '9:21', label: '9:21' },
];

const ASPECT_DESCRIPTIONS: Record<string, Message> = {
  original: msg('settings-controls:display.aspect.description.original'),
  auto: msg('settings-controls:display.aspect.description.auto'),
  screen: msg('settings-controls:display.aspect.description.screen'),
  wide: msg('settings-controls:display.aspect.description.wide'),
  tall: msg('settings-controls:display.aspect.description.tall'),
  custom: msg('settings-controls:display.aspect.description.custom'),
};

const EXTENDED_ONLY_KEYS = new Set([
  'linearWorldTilemap', 'ultrawideRendering', 'tallRendering', 'aspectRatio', 'extendY', 'widescreenVisualFixes',
  'widescreenSprites', 'widescreenPlayArea', 'offscreenAI', 'cameraLockToViewport', 'smoothTransitions',
]);

const ASPECT_KEYS: RatioKeys = { ratio: 'aspectRatio', w: 'customAspectW', h: 'customAspectH' };

const ASPECT_LOCKED_MESSAGE = msg('settings-controls:display.aspect.locked');

export {
  ASPECT_DESCRIPTIONS, ASPECT_KEYS, ASPECT_LOCKED_MESSAGE, EXTENDED_ONLY_KEYS, REQUIRES_LINEAR, REQUIRES_ULTRAWIDE, TALL_PRESETS, TALL_PRESET_VALUES,
  TALL_ULTRAWIDE_FALLBACK, TALL_ULTRAWIDE_PRESET,
};
