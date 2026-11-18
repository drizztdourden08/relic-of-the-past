/* @layer renderer-components @kind logic */
import type { ProgressTone } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { TextLimit } from '@rotp/languages';
import type { SlotFit } from './text-groups.type';

const variantFor = (used: number, max: number): ProgressTone => {
  if (used > max) return 'danger';
  if (used >= max) return 'primary';
  return 'secondary';
};

const detailOf = (t: I18n['t'], limit: Exclude<TextLimit, { kind: 'none' }>, used: number): string => {
  const lines = limit.kind === 'glyphs' && limit.lines ? limit.lines : 0;
  const values = { used, max: limit.max, lines };
  if (limit.kind === 'glyphs') {
    return lines > 0
      ? t('language-editor:slot.fit.characters-lines', values)
      : t('language-editor:slot.fit.characters', values);
  }
  return t('language-editor:slot.fit.tiles', values);
};

const fitOf = (t: I18n['t'], limit: TextLimit, value: string): SlotFit | null => {
  if (limit.kind === 'none') return null;

  const used = [...value].length;
  const lines = limit.kind === 'glyphs' && limit.lines ? ` x${limit.lines}` : '';

  return {
    used,
    max: limit.max,
    variant: variantFor(used, limit.max),
    readout: `${used}/${limit.max}${lines}`,
    detail: detailOf(t, limit, used),
  };
};

export { fitOf };
