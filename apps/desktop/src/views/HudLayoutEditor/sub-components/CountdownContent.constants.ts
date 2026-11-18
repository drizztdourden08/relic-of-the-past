/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { HudCountdownVariantChoice } from '@rotp/hud';

const PIE_OPTIONS: { value: HudCountdownVariantChoice; label: Message; title: Message }[] = [
  { value: 'setting', label: msg('hud-editor:countdown.pie.profile'), title: msg('hud-editor:countdown.pie.profile.title') },
  { value: 'pixel', label: msg('hud-editor:countdown.pie.pixel'), title: msg('hud-editor:countdown.pie.pixel.title') },
  { value: 'smooth', label: msg('hud-editor:countdown.pie.smooth'), title: msg('hud-editor:countdown.pie.smooth.title') },
];

export { PIE_OPTIONS };
