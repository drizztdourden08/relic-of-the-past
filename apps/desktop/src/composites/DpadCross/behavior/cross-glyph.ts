/* @layer renderer-components @kind logic */
import { INPUT_ICONS } from '@drizztdourden08/tessera/primitives';
import type { CrossGlyph } from '../DpadCross.type';
import { glyphMarkup } from './glyph-markup';
import { pathData } from './path-data';
import { pathExtent } from './path-extent';

const armOf = (entry: string | { body: string }): string => pathData(glyphMarkup(entry), true);

const crossGlyph = (): CrossGlyph => {
  const icons = INPUT_ICONS.generic;
  const body = pathData(glyphMarkup(icons.dpad), false);
  return {
    body,
    arms: {
      up: armOf(icons['dpad-up']), right: armOf(icons['dpad-right']), down: armOf(icons['dpad-down']), left: armOf(icons['dpad-left']),
    },
    ...pathExtent(body),
  };
};

export { crossGlyph };
