/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: msg('views-touch-controls:layer.haptics'), icon: 'vibrate', order: 2, keywords: ['haptics', 'rumble', 'vibration', 'controller'] };

const sections: SectionDef[] = [
  {
    id: 'haptics-general',
    title: msg('settings-haptics:section.haptics-general.title'),
    items: [
      { key: 'haptics.enabled', label: msg('settings-haptics:haptics.enabled.label'), description: msg('settings-haptics:haptics.enabled.description'), keywords: 'vibration rumble haptic feedback controller' },
      { key: 'haptics.intensity', label: msg('settings-haptics:haptics.intensity.label'), description: msg('settings-haptics:haptics.intensity.description'), keywords: 'vibration intensity strength level' },
    ],
  },
  {
    id: 'haptics-combat',
    title: msg('settings-haptics:section.haptics-combat.title'),
    items: [
      { key: 'haptics.swordSwing', label: msg('settings-haptics:haptics.sword-swing.label'), description: msg('settings-haptics:haptics.sword-swing.description'), keywords: 'sword swing slash attack' },
      { key: 'haptics.swordHitEnemy', label: msg('settings-haptics:haptics.sword-hit-enemy.label'), description: msg('settings-haptics:haptics.sword-hit-enemy.description'), keywords: 'sword hit enemy damage' },
      { key: 'haptics.swordClink', label: msg('settings-haptics:haptics.sword-clink.label'), description: msg('settings-haptics:haptics.sword-clink.description'), keywords: 'sword clink deflect shield bounce' },
      { key: 'haptics.damageTaken', label: msg('settings-haptics:haptics.damage-taken.label'), description: msg('settings-haptics:haptics.damage-taken.description'), keywords: 'damage hurt health hearts' },
    ],
  },
  {
    id: 'haptics-actions',
    title: msg('settings-haptics:section.haptics-actions.title'),
    items: [
      { key: 'haptics.itemUse', label: msg('settings-haptics:haptics.item-use.label'), description: msg('settings-haptics:haptics.item-use.description'), keywords: 'item use bomb hookshot hammer rod medallion' },
      { key: 'haptics.dashVibration', label: msg('settings-haptics:haptics.dash-vibration.label'), description: msg('settings-haptics:haptics.dash-vibration.description'), keywords: 'dash run boots pegasus step rhythm' },
      { key: 'haptics.environmentalEffects', label: msg('settings-haptics:haptics.environmental-effects.label'), description: msg('settings-haptics:haptics.environmental-effects.description'), keywords: 'environment fall pit ledge water mirror chest' },
    ],
  },
];

export default sections;
export { meta };
