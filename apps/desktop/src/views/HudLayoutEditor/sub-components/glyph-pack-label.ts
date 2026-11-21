/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { GlyphPack } from '@rotp/input-mapping';

const glyphPackLabel = (pack: GlyphPack, t: I18n['t']): string => {
  if (!pack.builtIn) return pack.name;
  if (pack.id === 'keyboard') return t('hud-editor:glyph-pack.name.keyboard');
  if (pack.id === 'snes') return t('hud-editor:glyph-pack.name.snes');
  if (pack.id === 'generic') return t('hud-editor:glyph-pack.name.generic');
  return pack.name;
};

export { glyphPackLabel };
