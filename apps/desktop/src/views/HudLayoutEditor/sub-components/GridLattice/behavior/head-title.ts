/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';

const headTitle = (kind: 'column' | 'row', entry: { index: number; text: string; empty: boolean }, t: Translate): string => {
  const { index, text, empty } = entry;
  const word = kind === 'column' ? t('hud-editor:lattice.kind.column') : t('hud-editor:lattice.kind.row');
  return empty
    ? t('hud-editor:lattice.head-title-empty', { kind: word, index, text })
    : t('hud-editor:lattice.head-title', { kind: word, index, text });
};

export { headTitle };
